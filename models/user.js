/** User model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'
import db from './db'
import Contact from './contacts'
import Gallery from './gallery'

/**
 * utility function for hashing a raw string password
 *
 * @async
 * @param {string} pass
 * @return {Promise<string>} - hashed password
 */
async function encrypt_password(pass) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)

    return hash
}

/**
 * User model class
 *
 * @class
 */
class User {

    /**
     * Creates an instance of User.
     * 
     * @param {string} email
     * @param {string} first_name
     * @param {string} last_name
     * @param {string} username
     * @param {string} password
     * @param {string} [id=null]
     */
    constructor(first_name, last_name, username, password, id = null) {
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.password = password
        this.id = id || User.gen_uid()
    }

    /**
     * hashes the user's password
     *
     * @async
     */
    async hash_pass() {
        this.hash = await encrypt_password(this.password)
    }

    /**
     * save the User object into the database
     *
     * @return {Promise} - sqlite's run result 
     */
    save() {
        return db.run(`INSERT INTO users (
            user_id,
            first_name,
            last_name,
            username,
            pass_hash
        ) VALUES (?,?,?,?,?)`, [
            this.id,
            this.first_name,
            this.last_name,
            this.username,
            this.hash
        ])
    }

    /**
     * Get user's contact information
     *
     * @async
     * @type {Promise<Contact>}
     */
    get contact() {
        return (async () => {
            const res = await db.get(`SELECT * FROM contacts
                WHERE user_id=(?)`,
                [this.id]
            )

            if (res) {
                return new Contact(this, res.email, res.phone, res.id)
            }

            return null
        })()
    }

    /**
     * Get user's gallery
     *
     * @async
     * @type {Promise<Gallery>}
     */
    get gallery() {
        return (async () => {
            const res = await db.get(`SELECT * FROM galleries
                WHERE user_id=(?)`,
                [this.id]
            )

            if (res) {
                return new Gallery(this, res.id)
            }

            return null
        })()
    }

    /**
     * get user with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<User>} 
     */
    static async get(id) {
        const res = await db.get(`SELECT * FROM users
            WHERE user_id=(?)`,
            [id]
        )

        if (res) {
            const user = new User(
                res.first_name,
                res.last_name,
                res.username,
                '',
                res.user_id
            )

            user.hash = res.pass_hash

            return user
        }
    }

    /**
     * get user from the database if it exist
     *
     * @static
     * @async
     * @param {string} login_username
     * @return {Promise<User>}
     */
    static async get_user(login_username) {
        const res = await db.get(`SELECT * FROM users
            WHERE username=(?)`,
            [login_username]
        )

        if (res) {
            const user = new User(
                res.first_name,
                res.last_name,
                res.username,
                '',
                res.user_id
            )

            user.hash = res.pass_hash

            return user
        }
    }

    /**
     * checks if password string is identical to the stored hash
     *
     * @async
     * @param {string} login_password
     * @return {Promise<boolean>} - true if the hash and password are identical otherwise false
     */
    async verify_pass(login_password) {
        return bcrypt.compare(login_password, this.hash)
    }

    /**
     * generates a unique user UUID
     *
     * @static
     * @return {string} - unique user UUID
     */
    static gen_uid() {
        return `UID-${v4()}`
    }
}

export default User