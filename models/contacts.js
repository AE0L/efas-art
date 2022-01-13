/** Contact model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import db from './db'
import random_id from './util'

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
        const stmt = `INSERT INTO contacts (contact_id,user_id,email) VALUES (?,?,?)`
        const params = [this.id, this.user.id, this.email]

        return db.run(stmt, params)
    }
}

export default Contact