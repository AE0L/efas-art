/** User model
 * 
 * @module models/
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
 * @param {string} pass
 * @return {string} - hashed password
 */
async function encrypt_password(pass) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)

    return hash
}

/**
 * User model class
 *
 * @export
 * @class User
 */
export default class User {
    SAVE_STMT = `INSERT INTO users (user_id,first_name,last_name,username,pass_hash) VALUES (?,?,?,?,?)`
    GET_STMT = `SELECT * FROM users WHERE username='(?)'`

    /**
     * Creates an instance of User.
     * @param {string} email
     * @param {string} first_name
     * @param {string} last_name
     * @param {string} username
     * @param {string} password
     * @param {string} [id=null]
     * @memberof User
     */
    constructor(email, first_name, last_name, username, password, id = null) {
        this.email = email
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.password = password
        this.id = id || User.gen_uid()
    }

    /**
     * hashes the user's password
     *
     * @memberof User
     */
    async hash_pass() {
        this.hash = await encrypt_password(this.password)
    }

    /**
     * save the User object into the database
     *
     * @return {Promise} - sqlite's run result 
     * @memberof User
     */
    save() {
        const params = [this.id, this.first_name, this.last_name, this.username, this.hash]

        return db.run(this.SAVE_STMT, params)
    }

    /**
     * Get user's contact information
     *
     * @returns {Contact}
     * @memberof User
     */
    async get contacts() {
        const stmt = `SELECT * FROM contacts WHERE user_id='(?)'`
        const params = [this.id]
        const res = await db.get(stmt, params)

        if (res) {
            return new Contact(this, res.email, res.phone, res.id)
        }

        return null
    }

    /**
     * Get user's gallery
     *
     * @return {Gallery}
     * @memberof User
     */
    async get gallery() {
        const stmt = `SELECT * FROM galleries WHERE user_id='(?)'`
        const params = [this.id]
        const res = await db.get(stmt, params)

        if (res) {
            return new Gallery(this, res.id)
        }

        return null
    }

    /**
     * get record from the database with the same username
     *
     * @static
     * @param {string} login_username
     * @return {User | null} - User object if record is found, otherwise false
     * @memberof User
     */
    static async get(login_username) {
        const res = await db.get(this.GET_STMT, [login_username])

        if (res) {
            const { id, email, first_name, last_name, username, pass_hash } = res
            const user = new User(email, first_name, last_name, username, '', id)

            user.hash = pass_hash

            return user
        }

        return null
    }

    /**
     * checks if password string is identical to the stored hash
     *
     * @param {string} login_password
     * @return {Promise<boolean>} - true if the hash and password are identical otherwise false
     * @memberof User
     */
    async verify_pass(login_password) {
        return bcrypt.compare(login_password, this.hash)

    }

    /**
     * generates a unique user UUID
     *
     * @static
     * @return {string} - unique user UUID
     * @memberof User
     */
    static gen_uid() {
        return `UID-${v4()}`
    }
}