/**
* The `Matter.Constraint` module contains methods for creating and manipulating constraints.
* Constraints are used for specifying that a fixed distance must be maintained between two bodies (or a body and a fixed world-space position).
* The stiffness of constraints can be modified to create springs or elastic.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Constraint
*/

import Vertices from '../geometry/Vertices';
import Vector from '../geometry/Vector';
import Sleeping from '../core/Sleeping';
import Bounds from '../geometry/Bounds';
import Axes from '../geometry/Axes';
import Common from '../core/Common';

class Constraint {

    static _warming = 0.4;
    static _torqueDampen = 1;
    static _minLength = 0.000001;

    /**
     * Creates a new constraint.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * To simulate a revolute constraint (or pin joint) set `length: 0` and a high `stiffness` value (e.g. `0.7` or above).
     * If the constraint is unstable, try lowering the `stiffness` value and / or increasing `engine.constraintIterations`.
     * For compound bodies, constraints must be applied to the parent body (not one of its parts).
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @param {} options
     */
    constructor(options = {}) {
        Object.assign(this, options);

        // if bodies defined but no points, use body centre
        if (this.bodyA && !this.pointA) this.pointA = { x: 0, y: 0 };
        if (this.bodyB && !this.pointB) this.pointB = { x: 0, y: 0 };

        // calculate static length using initial world space points
        const initialPointA = this.bodyA ? Vector.add(this.bodyA.position, this.pointA) : this.pointA;
        const initialPointB = this.bodyB ? Vector.add(this.bodyB.position, this.pointB) : this.pointB;
        const length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));

        this.length = typeof this.length !== 'undefined' ? this.length : length;

        // option defaults
        this.id = this.id || Common.nextId();
        this.label = this.label || 'Constraint';
        this.type = 'constraint';
        this.stiffness = this.stiffness || (this.length > 0 ? 1 : 0.7);
        this.damping = this.damping || 0;
        this.angularStiffness = this.angularStiffness || 0;
        this.angleA = this.bodyA ? this.bodyA.angle : this.angleA;
        this.angleB = this.bodyB ? this.bodyB.angle : this.angleB;
        this.plugin = {};

        // render
        const render = {
            visible: true,
            lineWidth: 2,
            strokeStyle: '#ffffff',
            type: 'line',
            anchors: true
        };

        if (this.length === 0 && this.stiffness > 0.1) {
            render.type = 'pin';
            render.anchors = false;
        } else if (this.stiffness < 0.9) {
            render.type = 'spring';
        }

        this.render = Common.extend(render, this.render);
    }

    /**
     * Creates a new constraint.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * To simulate a revolute constraint (or pin joint) set `length: 0` and a high `stiffness` value (e.g. `0.7` or above).
     * If the constraint is unstable, try lowering the `stiffness` value and / or increasing `engine.constraintIterations`.
     * For compound bodies, constraints must be applied to the parent body (not one of its parts).
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {} options
     * @return {constraint} constraint
     */
    static create(options) {
        return new Constraint(options);
    }

    /**
     * Prepares for solving by constraint warming.
     * @private
     * @method preSolveAll
     * @param {body[]} bodies
     */
    static preSolveAll(bodies) {
        for (let i = 0; i < bodies.length; i += 1) {
            const body = bodies[i],
                impulse = body.constraintImpulse;

            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {
                continue;
            }

            body.position.x += impulse.x;
            body.position.y += impulse.y;
            body.angle += impulse.angle;
        }
    }

    /**
     * Solves all constraints in a list of collisions.
     * @private
     * @method solveAll
     * @param {constraint[]} constraints
     * @param {number} delta
     */
    static solveAll(constraints, delta) {
        const timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);

        // Solve fixed constraints first.
        for (let i = 0; i < constraints.length; i += 1) {
            const constraint = constraints[i],
                fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),
                fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);

            if (fixedA || fixedB) {
                Constraint.solve(constraints[i], timeScale);
            }
        }

        // Solve free constraints last.
        for (let i = 0; i < constraints.length; i += 1) {
            const constraint = constraints[i],
                fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),
                fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);

            if (!fixedA && !fixedB) {
                Constraint.solve(constraints[i], timeScale);
            }
        }
    }

    /**
     * Solves a distance constraint with Gauss-Siedel method.
     * @private
     * @method solve
     * @param {constraint} constraint
     * @param {number} timeScale
     */
    static solve(constraint, timeScale) {
        const bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB;

        if (!bodyA && !bodyB)
            return;

        // update reference angle
        if (bodyA && !bodyA.isStatic) {
            Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);
            constraint.angleA = bodyA.angle;
        }

        // update reference angle
        if (bodyB && !bodyB.isStatic) {
            Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);
            constraint.angleB = bodyB.angle;
        }

        let pointAWorld = pointA,
            pointBWorld = pointB;

        if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
        if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);

        if (!pointAWorld || !pointBWorld)
            return;

        const delta = Vector.sub(pointAWorld, pointBWorld);
        let currentLength = Vector.magnitude(delta);

        // prevent singularity
        if (currentLength < Constraint._minLength) {
            currentLength = Constraint._minLength;
        }

        // solve distance constraint with Gauss-Siedel method
        const difference = (currentLength - constraint.length) / currentLength,
            isRigid = constraint.stiffness >= 1 || constraint.length === 0,
            stiffness = isRigid ? constraint.stiffness * timeScale
                : constraint.stiffness * timeScale * timeScale,
            damping = constraint.damping * timeScale,
            force = Vector.mult(delta, difference * stiffness),
            massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0),
            inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0),
            resistanceTotal = massTotal + inertiaTotal;
        let torque,
            share,
            normal,
            normalVelocity,
            relativeVelocity;

        if (damping > 0) {
            const zero = Vector.create();
            normal = Vector.div(delta, currentLength);

            relativeVelocity = Vector.sub(
                bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
            );

            normalVelocity = Vector.dot(normal, relativeVelocity);
        }

        if (bodyA && !bodyA.isStatic) {
            share = bodyA.inverseMass / massTotal;

            // keep track of applied impulses for post solving
            bodyA.constraintImpulse.x -= force.x * share;
            bodyA.constraintImpulse.y -= force.y * share;

            // apply forces
            bodyA.position.x -= force.x * share;
            bodyA.position.y -= force.y * share;

            // apply damping
            if (damping > 0) {
                bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;
                bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;
            }

            // apply torque
            torque = (Vector.cross(pointA, force) / resistanceTotal) * Constraint._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);
            bodyA.constraintImpulse.angle -= torque;
            bodyA.angle -= torque;
        }

        if (bodyB && !bodyB.isStatic) {
            share = bodyB.inverseMass / massTotal;

            // keep track of applied impulses for post solving
            bodyB.constraintImpulse.x += force.x * share;
            bodyB.constraintImpulse.y += force.y * share;

            // apply forces
            bodyB.position.x += force.x * share;
            bodyB.position.y += force.y * share;

            // apply damping
            if (damping > 0) {
                bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;
                bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;
            }

            // apply torque
            torque = (Vector.cross(pointB, force) / resistanceTotal) * Constraint._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
            bodyB.constraintImpulse.angle += torque;
            bodyB.angle += torque;
        }
    }

    /**
     * Performs body updates required after solving constraints.
     * @private
     * @method postSolveAll
     * @param {body[]} bodies
     */
    static postSolveAll(bodies) {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i],
                impulse = body.constraintImpulse;

            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {
                continue;
            }

            Sleeping.set(body, false);

            // update geometry and reset
            for (let j = 0; j < body.parts.length; j++) {
                const part = body.parts[j];

                Vertices.translate(part.vertices, impulse);

                if (j > 0) {
                    part.position.x += impulse.x;
                    part.position.y += impulse.y;
                }

                if (impulse.angle !== 0) {
                    Vertices.rotate(part.vertices, impulse.angle, body.position);
                    Axes.rotate(part.axes, impulse.angle);
                    if (j > 0) {
                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                    }
                }

                Bounds.update(part.bounds, part.vertices, body.velocity);
            }

            // dampen the cached impulse for warming next step
            impulse.angle *= Constraint._warming;
            impulse.x *= Constraint._warming;
            impulse.y *= Constraint._warming;
        }
    }

    /**
     * Returns the world-space position of `constraint.pointA`, accounting for `constraint.bodyA`.
     * @method pointAWorld
     * @param {constraint} constraint
     * @returns {vector} the world-space position
     */
    static pointAWorld(constraint) {
        return {
            x: (constraint.bodyA ? constraint.bodyA.position.x : 0)
                + (constraint.pointA ? constraint.pointA.x : 0),
            y: (constraint.bodyA ? constraint.bodyA.position.y : 0)
                + (constraint.pointA ? constraint.pointA.y : 0)
        };
    }

    /**
     * Returns the world-space position of `constraint.pointB`, accounting for `constraint.bodyB`.
     * @method pointBWorld
     * @param {constraint} constraint
     * @returns {vector} the world-space position
     */
    static pointBWorld(constraint) {
        return {
            x: (constraint.bodyB ? constraint.bodyB.position.x : 0)
                + (constraint.pointB ? constraint.pointB.x : 0),
            y: (constraint.bodyB ? constraint.bodyB.position.y : 0)
                + (constraint.pointB ? constraint.pointB.y : 0)
        };
    }

    /**
     * Returns the current length of the constraint.
     * This is the distance between both of the constraint's end points.
     * See `constraint.length` for the target rest length.
     * @method currentLength
     * @param {constraint} constraint
     * @returns {number} the current length
     */
    static currentLength(constraint) {
        const pointAX = (constraint.bodyA ? constraint.bodyA.position.x : 0)
            + (constraint.pointA ? constraint.pointA.x : 0);

        const pointAY = (constraint.bodyA ? constraint.bodyA.position.y : 0)
            + (constraint.pointA ? constraint.pointA.y : 0);

        const pointBX = (constraint.bodyB ? constraint.bodyB.position.x : 0)
            + (constraint.pointB ? constraint.pointB.x : 0);

        const pointBY = (constraint.bodyB ? constraint.bodyB.position.y : 0)
            + (constraint.pointB ? constraint.pointB.y : 0);

        const deltaX = pointAX - pointBX;
        const deltaY = pointAY - pointBY;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
}

/*
*
*  Properties Documentation
*
*/

/**
 * An integer `Number` uniquely identifying number generated in `Composite.create` by `Common.nextId`.
 *
 * @property id
 * @type number
 */

/**
 * A `String` denoting the type of object.
 *
 * @property type
 * @type string
 * @default "constraint"
 * @readOnly
 */

/**
 * An arbitrary `String` name to help the user identify and manage bodies.
 *
 * @property label
 * @type string
 * @default "Constraint"
 */

/**
 * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.
 *
 * @property render
 * @type object
 */

/**
 * A flag that indicates if the constraint should be rendered.
 *
 * @property render.visible
 * @type boolean
 * @default true
 */

/**
 * A `Number` that defines the line width to use when rendering the constraint outline.
 * A value of `0` means no outline will be rendered.
 *
 * @property render.lineWidth
 * @type number
 * @default 2
 */

/**
 * A `String` that defines the stroke style to use when rendering the constraint outline.
 * It is the same as when using a canvas, so it accepts CSS style property values.
 *
 * @property render.strokeStyle
 * @type string
 * @default a random colour
 */

/**
 * A `String` that defines the constraint rendering type.
 * The possible values are 'line', 'pin', 'spring'.
 * An appropriate render type will be automatically chosen unless one is given in options.
 *
 * @property render.type
 * @type string
 * @default 'line'
 */

/**
 * A `Boolean` that defines if the constraint's anchor points should be rendered.
 *
 * @property render.anchors
 * @type boolean
 * @default true
 */

/**
 * The first possible `Body` that this constraint is attached to.
 *
 * @property bodyA
 * @type body
 * @default null
 */

/**
 * The second possible `Body` that this constraint is attached to.
 *
 * @property bodyB
 * @type body
 * @default null
 */

/**
 * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyA` if defined, otherwise a world-space position.
 *
 * @property pointA
 * @type vector
 * @default { x: 0, y: 0 }
 */

/**
 * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyB` if defined, otherwise a world-space position.
 *
 * @property pointB
 * @type vector
 * @default { x: 0, y: 0 }
 */

/**
 * A `Number` that specifies the stiffness of the constraint, i.e. the rate at which it returns to its resting `constraint.length`.
 * A value of `1` means the constraint should be very stiff.
 * A value of `0.2` means the constraint acts like a soft spring.
 *
 * @property stiffness
 * @type number
 * @default 1
 */

/**
 * A `Number` that specifies the damping of the constraint,
 * i.e. the amount of resistance applied to each body based on their velocities to limit the amount of oscillation.
 * Damping will only be apparent when the constraint also has a very low `stiffness`.
 * A value of `0.1` means the constraint will apply heavy damping, resulting in little to no oscillation.
 * A value of `0` means the constraint will apply no damping.
 *
 * @property damping
 * @type number
 * @default 0
 */

/**
 * A `Number` that specifies the target resting length of the constraint.
 * It is calculated automatically in `Constraint.create` from initial positions of the `constraint.bodyA` and `constraint.bodyB`.
 *
 * @property length
 * @type number
 */

/**
 * An object reserved for storing plugin-specific properties.
 *
 * @property plugin
 * @type {}
 */

export default Constraint;
