/**
* The `Matter.Contact` module contains methods for creating and manipulating collision contacts.
*
* @class Contact
*/

class Contact {
    /**
     * Creates a new contact.
     * @method create
     * @param {vertex} [vertex]
     * @return {contact} A new contact
     */
    constructor(vertex) {
        this.vertex = vertex;
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
    }

    /**
     * Creates a new contact.
     * @method create
     * @param {vertex} [vertex]
     * @return {contact} A new contact
     */
    static create(vertex) {
        return new Contact(vertex);
    }
}

export default Contact;
