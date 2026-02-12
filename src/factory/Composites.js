/**
* The `Matter.Composites` module contains factory methods for creating composite bodies
* with commonly used configurations (such as stacks and chains).
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Composites
*/

import Composite from '../body/Composite';
import Constraint from '../constraint/Constraint';
import Common from '../core/Common';
import Body from '../body/Body';

class Composites {
    /**
     * Create a new composite containing bodies created in the callback in a grid arrangement.
     * This function uses the body's bounds to prevent overlaps.
     * @method stack
     * @param {number} x Starting position in X.
     * @param {number} y Starting position in Y.
     * @param {number} columns
     * @param {number} rows
     * @param {number} columnGap
     * @param {number} rowGap
     * @param {function} callback
     * @return {composite} A new composite containing objects created in the callback
     */
    static stack(x, y, columns, rows, columnGap, rowGap, callback) {
        const stack = Composite.create({ label: 'Stack' });
        let currentX = x,
            currentY = y,
            lastBody,
            i = 0;

        for (let row = 0; row < rows; row++) {
            let maxHeight = 0;

            for (let column = 0; column < columns; column++) {
                const body = callback(currentX, currentY, column, row, lastBody, i);

                if (body) {
                    const bodyHeight = body.bounds.max.y - body.bounds.min.y,
                        bodyWidth = body.bounds.max.x - body.bounds.min.x;

                    if (bodyHeight > maxHeight)
                        maxHeight = bodyHeight;

                    Body.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });

                    currentX = body.bounds.max.x + columnGap;

                    Composite.addBody(stack, body);

                    lastBody = body;
                    i += 1;
                } else {
                    currentX += columnGap;
                }
            }

            currentY += maxHeight + rowGap;
            currentX = x;
        }

        return stack;
    }

    /**
     * Chains all bodies in the given composite together using constraints.
     * @method chain
     * @param {composite} composite
     * @param {number} xOffsetA
     * @param {number} yOffsetA
     * @param {number} xOffsetB
     * @param {number} yOffsetB
     * @param {object} options
     * @return {composite} A new composite containing objects chained together with constraints
     */
    static chain(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
        const bodies = composite.bodies;

        for (let i = 1; i < bodies.length; i++) {
            const bodyA = bodies[i - 1],
                bodyB = bodies[i],
                bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,
                bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x,
                bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,
                bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;

            const defaults = {
                bodyA: bodyA,
                pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                bodyB: bodyB,
                pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
            };

            const constraint = Common.extend(defaults, options);

            Composite.addConstraint(composite, Constraint.create(constraint));
        }

        composite.label += ' Chain';

        return composite;
    }

    /**
     * Connects bodies in the composite with constraints in a grid pattern, with optional cross braces.
     * @method mesh
     * @param {composite} composite
     * @param {number} columns
     * @param {number} rows
     * @param {boolean} crossBrace
     * @param {object} options
     * @return {composite} The composite containing objects meshed together with constraints
     */
    static mesh(composite, columns, rows, crossBrace, options) {
        const bodies = composite.bodies;
        let row,
            col,
            bodyA,
            bodyB,
            bodyC;

        for (row = 0; row < rows; row++) {
            for (col = 1; col < columns; col++) {
                bodyA = bodies[(col - 1) + (row * columns)];
                bodyB = bodies[col + (row * columns)];
                Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));
            }

            if (row > 0) {
                for (col = 0; col < columns; col++) {
                    bodyA = bodies[col + ((row - 1) * columns)];
                    bodyB = bodies[col + (row * columns)];
                    Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));

                    if (crossBrace && col > 0) {
                        bodyC = bodies[(col - 1) + ((row - 1) * columns)];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));
                    }

                    if (crossBrace && col < columns - 1) {
                        bodyC = bodies[(col + 1) + ((row - 1) * columns)];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));
                    }
                }
            }
        }

        composite.label += ' Mesh';

        return composite;
    }

    /**
     * Create a new composite containing bodies created in the callback in a pyramid arrangement.
     * This function uses the body's bounds to prevent overlaps.
     * @method pyramid
     * @param {number} x Starting position in X.
     * @param {number} y Starting position in Y.
     * @param {number} columns
     * @param {number} rows
     * @param {number} columnGap
     * @param {number} rowGap
     * @param {function} callback
     * @return {composite} A new composite containing objects created in the callback
     */
    static pyramid(x, y, columns, rows, columnGap, rowGap, callback) {
        return Composites.stack(x, y, columns, rows, columnGap, rowGap, (stackX, stackY, column, row, lastBody, i) => {
            const actualRows = Math.min(rows, Math.ceil(columns / 2)),
                lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;

            if (row > actualRows)
                return;

            // reverse row order
            row = actualRows - row;

            const start = row,
                end = columns - 1 - row;

            if (column < start || column > end)
                return;

            // retroactively fix the first body's position, since width was unknown
            if (i === 1) {
                Body.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
            }

            const xOffset = lastBody ? column * lastBodyWidth : 0;

            return callback(x + xOffset + column * columnGap, stackY, column, row, lastBody, i);
        });
    }

}

export default Composites;
