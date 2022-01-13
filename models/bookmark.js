import db from './db'
import random_id from './util'
import User from './user'
import Artwork from './artwork'

class Bookmark {
    constructor(user, artwork, bookmarked_date, id = null) {
        this.user = user
        this.artwork = artwork,
        this.bookmarked_date = bookmarked_date
        this.id = id || random_id()
    }

    async save() {
        return db.run(`
            INSERT INTO bookmarks (
                bookmark_id,
                user_id,
                artwork_id,
                bookmarked_date
            ) VALUES (?,?,?,?)
        `, [
            this.id,
            this.user.id,
            this.artwork.id,
            this.bookmarked_date
        ])
    }

    static async get(id) {
        const res = await db.get(`
            SELECT * FROM bookmarks
            WHERE bookmark_id=(?)
        `, [id])

        if (res) {
            return new Bookmark(
                await User.get(res.user_id),
                await Artwork.get(res.artwork_id),
                res.bookmarked_date,
                res.bookmark_id
            )
        }
    }
}

export default Bookmark
