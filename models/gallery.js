import { v4 } from 'uuid'
import db from './db'

export default class Gallery {
    constructor(user) {
        this.user = user
        this.id = Gallery.gen_id()
    }

    save() {
        const stmt = `INSERT INTO galleries (gallery_id, user_id) VALUES (?, ?)`
        const params = [this.id, this.user.id]

        return db.run(stmt, params)
    }

    static gen_id() {
        return `GID-${v4()}`
    }
}