/**
* The `Matter.Detector` module contains methods for efficiently detecting collisions between a list of bodies using a broadphase algorithm.
*
* @class Detector
*/

import Common from '../core/Common';
import Collision from './Collision';

const Detector = {};

/**
 * Creates a new collision detector.
 * @method create
 * @param {} options
 * @return {detector} A new collision detector
 */
Detector.create = function(options) {
    const defaults = {
        bodies: [],
        collisions: [],
        pairs: null
    };

    return Common.extend(defaults, options);
};

/**
 * Sets the list of bodies in the detector.
 * @method setBodies
 * @param {detector} detector
 * @param {body[]} bodies
 */
Detector.setBodies = function(detector, bodies) {
    detector.bodies = bodies.slice(0);
};

/**
 * Clears the detector including its list of bodies.
 * @method clear
 * @param {detector} detector
 */
Detector.clear = function(detector) {
    detector.bodies = [];
    detector.collisions = [];
};

/**
 * Efficiently finds all collisions among all the bodies in `detector.bodies` using a broadphase algorithm.
 *
 * _Note:_ The specific ordering of collisions returned is not guaranteed between releases and may change for performance reasons.
 * If a specific ordering is required then apply a sort to the resulting array.
 * @method collisions
 * @param {detector} detector
 * @return {collision[]} collisions
 */
Detector.collisions = function(detector) {
    const pairs = detector.pairs,
        bodies = detector.bodies,
        bodiesLength = bodies.length,
        canCollide = Detector.canCollide,
        collides = Collision.collides,
        collisions = detector.collisions;
    let collisionIndex = 0,
        i,
        j;

    bodies.sort(Detector._compareBoundsX);

    for (i = 0; i < bodiesLength; i++) {
        const bodyA = bodies[i],
            boundXMax = bodyA.bounds.max.x,
            boundYMax = bodyA.bounds.max.y,
            boundYMin = bodyA.bounds.min.y,
            bodyAStatic = bodyA.isStatic || bodyA.isSleeping,
            partsALength = bodyA.parts.length,
            partsASingle = partsALength === 1;

        for (j = i + 1; j < bodiesLength; j++) {
            const bodyB = bodies[j],
                boundsB = bodyB.bounds;

            if (boundsB.min.x > boundXMax) {
                break;
            }

            if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {
                continue;
            }

            if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                continue;
            }

            if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                continue;
            }

            const partsBLength = bodyB.parts.length;

            if (partsASingle && partsBLength === 1) {
                const collision = collides(bodyA, bodyB, pairs);

                if (collision) {
                    collisions[collisionIndex++] = collision;
                }
            } else {
                const partsAStart = partsALength > 1 ? 1 : 0,
                    partsBStart = partsBLength > 1 ? 1 : 0;

                for (let k = partsAStart; k < partsALength; k++) {
                    const partA = bodyA.parts[k],
                        boundsA = partA.bounds;

                    for (let z = partsBStart; z < partsBLength; z++) {
                        const partB = bodyB.parts[z],
                            boundsB = partB.bounds;

                        if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x
                            || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                            continue;
                        }

                        const collision = collides(partA, partB, pairs);

                        if (collision) {
                            collisions[collisionIndex++] = collision;
                        }
                    }
                }
            }
        }
    }

    if (collisions.length !== collisionIndex) {
        collisions.length = collisionIndex;
    }

    return collisions;
};

/**
 * Returns `true` if both supplied collision filters will allow a collision to occur.
 * See `body.collisionFilter` for more information.
 * @method canCollide
 * @param {} filterA
 * @param {} filterB
 * @return {bool} `true` if collision can occur
 */
Detector.canCollide = function(filterA, filterB) {
    if (filterA.group === filterB.group && filterA.group !== 0)
        return filterA.group > 0;

    return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
};

/**
 * The comparison function used in the broadphase algorithm.
 * Returns the signed delta of the bodies bounds on the x-axis.
 * @private
 * @method _sortCompare
 * @param {body} bodyA
 * @param {body} bodyB
 * @return {number} The signed delta used for sorting
 */
Detector._compareBoundsX = function(bodyA, bodyB) {
    return bodyA.bounds.min.x - bodyB.bounds.min.x;
};

/*
*
*  Properties Documentation
*
*/

/**
 * The array of `Matter.Body` between which the detector finds collisions.
 *
 * _Note:_ The order of bodies in this array _is not fixed_ and will be continually managed by the detector.
 * @property bodies
 * @type body[]
 * @default []
 */

/**
 * The array of `Matter.Collision` found in the last call to `Detector.collisions` on this detector.
 * @property collisions
 * @type collision[]
 * @default []
 */

/**
 * Optional. A `Matter.Pairs` object from which previous collision objects may be reused. Intended for internal `Matter.Engine` usage.
 * @property pairs
 * @type {pairs|null}
 * @default null
 */

export default Detector;
