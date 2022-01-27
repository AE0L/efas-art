/** Contact model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const db = require('./db')
const { random_id } = require('./util')

/**
 * Contact model class
 * 
 * @class
 */
class Contact {
    /**
     * Creates an instance of Contact.
     * 
     * @param {User} user
     * @param {string} email
     * @param {string} [id=null]
     */
    constructor(user, email, phone, id = null) {
        this.user = user
        this.email = email
        this.phone = phone
        this.id = id || random_id()
    }

    /**
     * Save the Contact object in the database
     *
     * @return {Promise} - sqlite run result
     */
    save() {
        return db.run(`
            INSERT INTO contacts (
                contact_id,
                user_id,
                email,
                phone
            ) VALUES (?,?,?,?)
        `, [
            this.id,
            this.user.id,
            this.email,
            this.phone
        ])
    }

    static async email_exists(email) {
        const res = await db.get(`
            SELECT * FROM contacts
            WHERE email=(?)
        `, [email])

        return res ? true : false
    }

    remove() {
        return db.run(`
            DELETE FROM contacts
            WHERE contact_id=?
        `, [this.id])
    }
}

module.exports = Contact