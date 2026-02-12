/**
* The `Matter.Pair` module contains methods for creating and manipulating collision pairs.
*
* @class Pair
*/

import Contact from './Contact';

class Pair {
    /**
     * Creates a pair.
     * @method create
     * @param {collision} collision
     * @param {number} timestamp
     * @return {pair} A new pair
     */
    constructor(collision, timestamp) {
        const bodyA = collision.bodyA,
            bodyB = collision.bodyB;

        this.id = Pair.id(bodyA, bodyB);
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.collision = collision;
        this.contacts = [Contact.create(), Contact.create()];
        this.contactCount = 0;
        this.separation = 0;
        this.isActive = true;
        this.isSensor = bodyA.isSensor || bodyB.isSensor;
        this.timeCreated = timestamp;
        this.timeUpdated = timestamp;
        this.inverseMass = 0;
        this.friction = 0;
        this.frictionStatic = 0;
        this.restitution = 0;
        this.slop = 0;

        Pair.update(this, collision, timestamp);
    }

    /**
     * Creates a pair.
     * @method create
     * @param {collision} collision
     * @param {number} timestamp
     * @return {pair} A new pair
     */
    static create(collision, timestamp) {
        return new Pair(collision, timestamp);
    }

    /**
     * Updates a pair given a collision.
     * @method update
     * @param {pair} pair
     * @param {collision} collision
     * @param {number} timestamp
     */
    static update(pair, collision, timestamp) {
        const supports = collision.supports,
            supportCount = collision.supportCount,
            contacts = pair.contacts,
            parentA = collision.parentA,
            parentB = collision.parentB;

        pair.isActive = true;
        pair.timeUpdated = timestamp;
        pair.collision = collision;
        pair.separation = collision.depth;
        pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
        pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;
        pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
        pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
        pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;

        pair.contactCount = supportCount;
        collision.pair = pair;

        const supportA = supports[0],
            supportB = supports[1];
        let contactA = contacts[0],
            contactB = contacts[1];

        // match contacts to supports
        if (contactB.vertex === supportA || contactA.vertex === supportB) {
            contacts[1] = contactA;
            contacts[0] = contactA = contactB;
            contactB = contacts[1];
        }

        // update contacts
        contactA.vertex = supportA;
        contactB.vertex = supportB;
    }

    /**
     * Set a pair as active or inactive.
     * @method setActive
     * @param {pair} pair
     * @param {bool} isActive
     * @param {number} timestamp
     */
    static setActive(pair, isActive, timestamp) {
        if (isActive) {
            pair.isActive = true;
            pair.timeUpdated = timestamp;
        } else {
            pair.isActive = false;
            pair.contactCount = 0;
        }
    }

    /**
     * Get the id for the given pair.
     * @method id
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {string} Unique pairId
     */
    static id(bodyA, bodyB) {
        return bodyA.id < bodyB.id ? `${bodyA.id.toString(36)}:${bodyB.id.toString(36)}`
            : `${bodyB.id.toString(36)}:${bodyA.id.toString(36)}`;
    }
}

export default Pair;
