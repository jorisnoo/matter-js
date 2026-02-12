/**
* The `Matter.Resolver` module contains methods for resolving collision pairs.
*
* @class Resolver
*/

const Resolver = {};

module.exports = Resolver;

const Vertices = require('../geometry/Vertices');
const Common = require('../core/Common');
const Bounds = require('../geometry/Bounds');

(function() {

    Resolver._restingThresh = 2;
    Resolver._restingThreshTangent = Math.sqrt(6);
    Resolver._positionDampen = 0.9;
    Resolver._positionWarming = 0.8;
    Resolver._frictionNormalMultiplier = 5;
    Resolver._frictionMaxStatic = Number.MAX_VALUE;

    /**
     * Prepare pairs for position solving.
     * @method preSolvePosition
     * @param {pair[]} pairs
     */
    Resolver.preSolvePosition = function(pairs) {
        let i,
            pair,
            contactCount;
        const pairsLength = pairs.length;

        // find total contacts on each body
        for (i = 0; i < pairsLength; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            contactCount = pair.contactCount;
            pair.collision.parentA.totalContacts += contactCount;
            pair.collision.parentB.totalContacts += contactCount;
        }
    };

    /**
     * Find a solution for pair positions.
     * @method solvePosition
     * @param {pair[]} pairs
     * @param {number} delta
     * @param {number} [damping=1]
     */
    Resolver.solvePosition = function(pairs, delta, damping) {
        let i,
            pair,
            collision,
            bodyA,
            bodyB,
            normal,
            contactShare,
            positionImpulse;
        const positionDampen = Resolver._positionDampen * (damping || 1),
            slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1),
            pairsLength = pairs.length;

        // find impulses required to resolve penetration
        for (i = 0; i < pairsLength; i++) {
            pair = pairs[i];
            
            if (!pair.isActive || pair.isSensor)
                continue;

            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;

            // get current separation between body edges involved in collision
            pair.separation = 
                collision.depth + normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x)
                + normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
        }
        
        for (i = 0; i < pairsLength; i++) {
            pair = pairs[i];

            if (!pair.isActive || pair.isSensor)
                continue;
            
            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;
            positionImpulse = pair.separation - pair.slop * slopDampen;

            if (bodyA.isStatic || bodyB.isStatic)
                positionImpulse *= 2;
            
            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                contactShare = positionDampen / bodyA.totalContacts;
                bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                contactShare = positionDampen / bodyB.totalContacts;
                bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
            }
        }
    };

    /**
     * Apply position resolution.
     * @method postSolvePosition
     * @param {body[]} bodies
     */
    Resolver.postSolvePosition = function(bodies) {
        const positionWarming = Resolver._positionWarming,
            bodiesLength = bodies.length,
            verticesTranslate = Vertices.translate,
            boundsUpdate = Bounds.update;

        for (let i = 0; i < bodiesLength; i++) {
            const body = bodies[i],
                positionImpulse = body.positionImpulse,
                positionImpulseX = positionImpulse.x,
                positionImpulseY = positionImpulse.y,
                velocity = body.velocity;

            // reset contact count
            body.totalContacts = 0;

            if (positionImpulseX !== 0 || positionImpulseY !== 0) {
                // update body geometry
                for (let j = 0; j < body.parts.length; j++) {
                    const part = body.parts[j];
                    verticesTranslate(part.vertices, positionImpulse);
                    boundsUpdate(part.bounds, part.vertices, velocity);
                    part.position.x += positionImpulseX;
                    part.position.y += positionImpulseY;
                }

                // move the body without changing velocity
                body.positionPrev.x += positionImpulseX;
                body.positionPrev.y += positionImpulseY;

                if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {
                    // reset cached impulse if the body has velocity along it
                    positionImpulse.x = 0;
                    positionImpulse.y = 0;
                } else {
                    // warm the next iteration
                    positionImpulse.x *= positionWarming;
                    positionImpulse.y *= positionWarming;
                }
            }
        }
    };

    /**
     * Prepare pairs for velocity solving.
     * @method preSolveVelocity
     * @param {pair[]} pairs
     */
    Resolver.preSolveVelocity = function(pairs) {
        const pairsLength = pairs.length;
        let i,
            j;
        
        for (i = 0; i < pairsLength; i++) {
            const pair = pairs[i];

            if (!pair.isActive || pair.isSensor)
                continue;

            const contacts = pair.contacts,
                contactCount = pair.contactCount,
                collision = pair.collision,
                bodyA = collision.parentA,
                bodyB = collision.parentB,
                normal = collision.normal,
                tangent = collision.tangent;

            // resolve each contact
            for (j = 0; j < contactCount; j++) {
                const contact = contacts[j],
                    contactVertex = contact.vertex,
                    normalImpulse = contact.normalImpulse,
                    tangentImpulse = contact.tangentImpulse;

                if (normalImpulse !== 0 || tangentImpulse !== 0) {
                    // total impulse from contact
                    const impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse,
                        impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;
                    
                    // apply impulse from contact
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                        bodyA.anglePrev += bodyA.inverseInertia * (
                            (contactVertex.x - bodyA.position.x) * impulseY
                            - (contactVertex.y - bodyA.position.y) * impulseX
                        );
                    }
    
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                        bodyB.anglePrev -= bodyB.inverseInertia * (
                            (contactVertex.x - bodyB.position.x) * impulseY 
                            - (contactVertex.y - bodyB.position.y) * impulseX
                        );
                    }
                }
            }
        }
    };

    /**
     * Find a solution for pair velocities.
     * @method solveVelocity
     * @param {pair[]} pairs
     * @param {number} delta
     */
    Resolver.solveVelocity = function(pairs, delta) {
        const timeScale = delta / Common._baseDelta,
            timeScaleSquared = timeScale * timeScale,
            timeScaleCubed = timeScaleSquared * timeScale,
            restingThresh = -Resolver._restingThresh * timeScale,
            restingThreshTangent = Resolver._restingThreshTangent,
            frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale,
            frictionMaxStatic = Resolver._frictionMaxStatic,
            pairsLength = pairs.length;
        let tangentImpulse,
            maxFriction,
            i,
            j;

        for (i = 0; i < pairsLength; i++) {
            const pair = pairs[i];

            if (!pair.isActive || pair.isSensor)
                continue;

            const collision = pair.collision,
                bodyA = collision.parentA,
                bodyB = collision.parentB,
                normalX = collision.normal.x,
                normalY = collision.normal.y,
                tangentX = collision.tangent.x,
                tangentY = collision.tangent.y,
                inverseMassTotal = pair.inverseMass,
                friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier,
                contacts = pair.contacts,
                contactCount = pair.contactCount,
                contactShare = 1 / contactCount;

            // get body velocities
            const bodyAVelocityX = bodyA.position.x - bodyA.positionPrev.x,
                bodyAVelocityY = bodyA.position.y - bodyA.positionPrev.y,
                bodyAAngularVelocity = bodyA.angle - bodyA.anglePrev,
                bodyBVelocityX = bodyB.position.x - bodyB.positionPrev.x,
                bodyBVelocityY = bodyB.position.y - bodyB.positionPrev.y,
                bodyBAngularVelocity = bodyB.angle - bodyB.anglePrev;

            // resolve each contact
            for (j = 0; j < contactCount; j++) {
                const contact = contacts[j],
                    contactVertex = contact.vertex;

                const offsetAX = contactVertex.x - bodyA.position.x,
                    offsetAY = contactVertex.y - bodyA.position.y,
                    offsetBX = contactVertex.x - bodyB.position.x,
                    offsetBY = contactVertex.y - bodyB.position.y;

                const velocityPointAX = bodyAVelocityX - offsetAY * bodyAAngularVelocity,
                    velocityPointAY = bodyAVelocityY + offsetAX * bodyAAngularVelocity,
                    velocityPointBX = bodyBVelocityX - offsetBY * bodyBAngularVelocity,
                    velocityPointBY = bodyBVelocityY + offsetBX * bodyBAngularVelocity;

                const relativeVelocityX = velocityPointAX - velocityPointBX,
                    relativeVelocityY = velocityPointAY - velocityPointBY;

                const normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY,
                    tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;

                // coulomb friction
                const normalOverlap = pair.separation + normalVelocity;
                let normalForce = Math.min(normalOverlap, 1);
                normalForce = normalOverlap < 0 ? 0 : normalForce;

                const frictionLimit = normalForce * friction;

                if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {
                    maxFriction = (tangentVelocity > 0 ? tangentVelocity : -tangentVelocity);
                    tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;
                    
                    if (tangentImpulse < -maxFriction) {
                        tangentImpulse = -maxFriction;
                    } else if (tangentImpulse > maxFriction) {
                        tangentImpulse = maxFriction;
                    }
                } else {
                    tangentImpulse = tangentVelocity;
                    maxFriction = frictionMaxStatic;
                }

                // account for mass, inertia and contact offset
                const oAcN = offsetAX * normalY - offsetAY * normalX,
                    oBcN = offsetBX * normalY - offsetBY * normalX,
                    share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);

                // raw impulses
                let normalImpulse = (1 + pair.restitution) * normalVelocity * share;
                tangentImpulse *= share;

                // handle high velocity and resting collisions separately
                if (normalVelocity < restingThresh) {
                    // high normal velocity so clear cached contact normal impulse
                    contact.normalImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // impulse constraint tends to 0
                    const contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse += normalImpulse;
                    if (contact.normalImpulse > 0) contact.normalImpulse = 0;
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                }

                // handle high velocity and resting collisions separately
                if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {
                    // high tangent velocity so clear cached contact tangent impulse
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // tangent impulse tends to -tangentSpeed or +tangentSpeed
                    const contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse += tangentImpulse;
                    if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;
                    if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }

                // total impulse from contact
                const impulseX = normalX * normalImpulse + tangentX * tangentImpulse,
                    impulseY = normalY * normalImpulse + tangentY * tangentImpulse;
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                    bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                    bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;
                }
            }
        }
    };

})();
