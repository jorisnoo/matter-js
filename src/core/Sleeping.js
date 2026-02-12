/**
* The `Matter.Sleeping` module contains methods to manage the sleeping state of bodies.
*
* @class Sleeping
*/

import Body from '../body/Body';
import Events from './Events';
import Common from './Common';

class Sleeping {
    static _motionWakeThreshold = 0.18;
    static _motionSleepThreshold = 0.08;
    static _minBias = 0.9;

    /**
     * Puts bodies to sleep or wakes them up depending on their motion.
     * @method update
     * @param {body[]} bodies
     * @param {number} delta
     */
    static update(bodies, delta) {
        const timeScale = delta / Common._baseDelta,
            motionSleepThreshold = Sleeping._motionSleepThreshold;

        // update bodies sleeping status
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i],
                speed = Body.getSpeed(body),
                angularSpeed = Body.getAngularSpeed(body),
                motion = speed * speed + angularSpeed * angularSpeed;

            // wake up bodies if they have a force applied
            if (body.force.x !== 0 || body.force.y !== 0) {
                Sleeping.set(body, false);
                continue;
            }

            const minMotion = Math.min(body.motion, motion),
                maxMotion = Math.max(body.motion, motion);

            // biased average motion estimation between frames
            body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;

            if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {
                body.sleepCounter += 1;

                if (body.sleepCounter >= body.sleepThreshold / timeScale) {
                    Sleeping.set(body, true);
                }
            } else if (body.sleepCounter > 0) {
                body.sleepCounter -= 1;
            }
        }
    }

    /**
     * Given a set of colliding pairs, wakes the sleeping bodies involved.
     * @method afterCollisions
     * @param {pair[]} pairs
     */
    static afterCollisions(pairs) {
        const motionSleepThreshold = Sleeping._motionSleepThreshold;

        // wake up bodies involved in collisions
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];

            // don't wake inactive pairs
            if (!pair.isActive)
                continue;

            const collision = pair.collision,
                bodyA = collision.bodyA.parent,
                bodyB = collision.bodyB.parent;

            // don't wake if at least one body is static
            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
                continue;

            if (bodyA.isSleeping || bodyB.isSleeping) {
                const sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;

                if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {
                    Sleeping.set(sleepingBody, false);
                }
            }
        }
    }

    /**
     * Set a body as sleeping or awake.
     * @method set
     * @param {body} body
     * @param {boolean} isSleeping
     */
    static set(body, isSleeping) {
        const wasSleeping = body.isSleeping;

        if (isSleeping) {
            body.isSleeping = true;
            body.sleepCounter = body.sleepThreshold;

            body.positionImpulse.x = 0;
            body.positionImpulse.y = 0;

            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;

            body.anglePrev = body.angle;
            body.speed = 0;
            body.angularSpeed = 0;
            body.motion = 0;

            if (!wasSleeping) {
                Events.trigger(body, 'sleepStart');
            }
        } else {
            body.isSleeping = false;
            body.sleepCounter = 0;

            if (wasSleeping) {
                Events.trigger(body, 'sleepEnd');
            }
        }
    }
}

export default Sleeping;
