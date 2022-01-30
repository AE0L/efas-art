/** User model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const bcrypt = require('bcrypt')
const { google } = require('googleapis')
const gutil = require('../google')
const db = require('./db')
const Follow = require('./follow')
const { random_id } = require('./util')
const moment = require('moment')
const Reaction = require('./reaction')

/**
 * utility function for hashing a raw string password
 *
 * @async
 * @param {string} pass
 * @return {Promise<string>} - hashed password
 */
async function encrypt_password(pass, salt = null) {
    salt = salt || await bcrypt.genSalt()
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
     * @param {string} root_dir
     * @param {string} [id=null]
     */
    constructor(first_name, last_name, username, password, id = null, root_dir = null) {
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.password = password
        this.id = id || random_id()
        this.root_dir = root_dir

        this.bio_text = ''
        this.birth_date = null
        this.profile_pic = ''
    }

    /**
     * hashes the user's password
     *
     * @async
     */
    async hash_pass(salt = null) {
        this.hash = await encrypt_password(this.password, salt)
    }

    /**
     * save the User object into the database
     *
     * @async
     * @return {Promise} - sqlite's run result 
     */
    save() {
        return db.run(`INSERT INTO users (
            user_id,
            first_name,
            last_name,
            username,
            pass_hash,
            bio_text,
            birth_date,
            profile_pic,
            root_dir
        ) VALUES (?,?,?,?,?,?,?,?,?)`, [
            this.id,
            this.first_name,
            this.last_name,
            this.username,
            this.hash,
            this.bio_text,
            this.birth_date,
            this.profile_pic,
            this.root_dir
        ])
    }

    update() {
        return db.run(`
            UPDATE users
            SET first_name=?,
                last_name=?,
                bio_text=?
            WHERE user_id=?
        `, [
            this.first_name,
            this.last_name,
            this.bio_text,
            this.id
        ])
    }

    async update_pass(new_pass) {
        this.password = new_pass

        await this.hash_pass()

        return db.run(`
            UPDATE users
            SET pass_hash=?
            WHERE user_id=?
        `, [this.hash, this.id])
    }

    /**
     * Get user's contact information
     *
     * @async
     * @type {Promise<Contact>}
     */
    get contact() {
        const Contact = require('./contacts')

        return (async () => {
            const res = await db.get(`SELECT * FROM contacts
                WHERE user_id=(?)`,
                [this.id]
            )

            if (res) {
                return new Contact(this, res.email, res.phone, res.contact_id)
            }
        })()
    }

    /**
     * Get user's gallery
     *
     * @async
     * @type {Promise<Gallery>}
     */
    get gallery() {
        const Gallery = require('./gallery')

        return (async () => {
            const res = await db.get(`SELECT * FROM galleries
                WHERE user_id=(?)`,
                [this.id]
            )

            if (res) {
                return new Gallery(this, res.gallery_id, res.art_col_dir, res.watermark_col_dir)
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
                res.user_id,
                res.root_dir
            )

            user.hash = res.pass_hash
            user.bio = res.bio_text
            user.birth_date = res.birth_date
            user.profile_pic = res.profile_pic

            return user
        }
    }

    static async get_user(username) {
        const res = await db.get(`SELECT * FROM users
            WHERE username=(?)`,
            [username]
        )

        if (res) {
            const user = new User(
                res.first_name,
                res.last_name,
                res.username,
                '',
                res.user_id,
                res.root_dir
            )

            user.hash = res.pass_hash
            user.bio = res.bio_text
            user.birth_date = res.birth_date
            user.profile_pic = res.profile_pic

            return user
        }
    }

    async get_follows() {
        const rows = await db.all(`
            SELECT * FROM follows
            WHERE user_id=(?)
        `, [this.id])

        if (rows) {
            const follows = []

            for (let row of rows) {
                follows.push(new Follow(
                    this,
                    await User.get(row.followed_id),
                    row.follow_date,
                    row.follow_id
                ))
            }

            return follows
        }
    }

    async is_following(user) {
        const res = await db.get(`
            SELECT * FROM follows
            WHERE user_id=(?) AND followed_id=(?)
        `, [this.id, user.id])

        return res ? true : false
    }

    async follow(user) {
        const follow = new Follow(this, user, moment().toLocaleString())

        return follow.save()
    }

    async unfollow(user) {
        const follow = await Follow.get(this, user)

        return follow.delete()
    }

    async like(art) {
        const reaction = await Reaction.get(this, art)
        
        reaction.like()
    }

    async unlike(art) {
        const reaction = await Reaction.get(this, art)

        reaction.unlike()
    }

    /**
     * checks if password string is identical to the stored hash
     *
     * @async
     * @param {string} login_password
     * @return {Promise<boolean>} - true if the hash and password are identical otherwise false
     */
    verify_pass(login_password) {
        return bcrypt.compare(login_password, this.hash)
    }

    async gen_root_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        const meta = {
            name: this.id,
            mimeType: gutil.constants.mime.folder,
            parents: [process.env.USER_FOLDER]
        }

        const res = await gd.files.create({
            resource: meta,
            fields: 'id'
        })

        this.root_dir = res.data.id
    }

    remove() {
        return db.run(`
            DELETE FROM users
            WHERE user_id=?
        `, [this.id])
    }

    async remove_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        return gd.files.delete({
            fileId: this.root_dir
        })
    }
}

module.exports = {
    encrypt_password: encrypt_password,
    User: User
}