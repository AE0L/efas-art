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

async function encrypt_password(pass, salt = null) {
    salt = salt || await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)

    return hash
}

class User {

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

    async hash_pass(salt = null) {
        this.hash = await encrypt_password(this.password, salt)
    }

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
            user.bio_text = res.bio_text
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

    static async get_email(email) {
        const res = await db.get(`SELECT * FROM contacts
            WHERE email=?`,
            [email]
        )

        if (res) {
            return User.get(res.user_id)
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

    async get_likes() {
        const Artwork = require('./artwork')

        const rows = await db.all(`
            SELECT * FROM reactions
            WHERE user_id=(?)
        `, [this.id])

        const likes = []

        for (let row of rows) {
            if (row.liked) {
                likes.push(new Reaction(
                    this,
                    await Artwork.get(row.artwork_id),
                    row.reaction_id,
                    row.liked
                ))
            }
        }

        return likes
    }

    async like(art) {
        const reaction = await Reaction.get(this, art)

        reaction.like()
    }

    async unlike(art) {
        const reaction = await Reaction.get(this, art)

        reaction.unlike()
    }

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

    static async find_all(query) {
        const rows = await db.all(`
            SELECT * FROM users
            WHERE first_name LIKE ? OR username LIKE ?
        `, [query, query])

        const users = []

        for (let row of rows) {
            const user = new User(
                row.first_name,
                row.last_name,
                row.username,
                '',
                row.user_id,
                row.root_dir
            )

            user.hash = row.pass_hash
            user.bio = row.bio_text
            user.birth_date = row.birth_date
            user.profile_pic = row.profile_pic

            users.push(user)
        }

        return users
    }
}

module.exports = {
    encrypt_password: encrypt_password,
    User: User
}