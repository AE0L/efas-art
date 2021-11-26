import { uuidv4 } from 'uuid'
import db from './db'

async function encrypt_password(pass) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)

    return hash
}

export default class User {
    constructor(email, first_name, last_name, username, password) {
        this.email = email
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.password = password

        this.hash = encrypt_password(this.password)
        this.id = User.gen_uid()
    }

    save() {
        const query = `INSERT INTO users (
            user_id,
            first_name,
            last_name,
            username,
            password_hash
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

    static search_user(username) {

    }

    static gen_uid() {
        return `UID-${uuidv4}`
    }
}