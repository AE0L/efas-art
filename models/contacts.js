import db from './db'
import { uuidv4 } from 'uuid'

export default class Contact {
    constructor(user, email) {
        this.user = user
        this.email = email
        this.id = Contact.gen_id()
    }

    save() {
        const stmt = `INSERT INTO contacts (
            contact_id,
            user_id,
            email
        )`
        const params = [
            this.id,
            this.user.id,
            this.email
        ]

        return db.run(stmt, params)
    }

    static gen_id() {
        return `CID-${uuidv4}`
    }
}