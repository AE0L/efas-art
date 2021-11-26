import { v4 } from 'uuid'
import bcrypt from 'bcrypt'
import db from './db'

async function encrypt_password(pass) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)

    return hash
}

export default class User {
    constructor(email, first_name, last_name, username, password, gen_id=true) {
        this.email = email
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.password = password

        if (gen_id) {
            this.id = User.gen_uid()
        }
    }

    static login_instance(user, pass) {
        return new User(null, null, null, user, pass, false)
    }

    async hash_pass() {
        this.hash = await encrypt_password(this.password)
    }

    save() {
        const query = `INSERT INTO users (
            user_id,
            first_name,
            last_name,
            username,
            pass_hash
        ) VALUES (?, ?, ?, ?, ?)`
        const params = [
            this.id,
            this.first_name,
            this.last_name,
            this.username,
            this.hash
        ]

        return db.run(query, params)
    }

    is_exist() {
        const query = `SELECT * FROM users WHERE username=(?)`
        const params = [this.username]

        return db.get(query, params)
    }

    async verify_pass() {
        const query = `SELECT password FROM users WHERE username=(?)`
        const params = [this.username]

        const res = await db.get(query, params)
        const stored_hash = res.password

        return bcrypt.compare(this.password, stored_hash)

    }

    static gen_uid() {
        return `UID-${v4()}`
    }
}