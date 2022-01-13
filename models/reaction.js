import db from './db'
import random_id from './util'
import User from './user'
import Artwork from './artwork'

class Reaction {
    constructor(user, artwork, liked, id = null) {
        this.user = user
        this.artwork = artwork
        this.liked = liked
        this.id = id || random_id()
    }

    async save() {
        return db.run(`
            INSERT INTO reactions (
                reaction_id,
                user_id,
                artwork_id,
                liked
            ) VALUES (?,?,?,?)
        `, [
            this.id,
            this.user.id,
            this.artwork.id,
            this.liked
        ])
    }

    static async get(id) {
        const res = await db.get(`
            SELECT * FROM reactions
            WHERE reaction_id=(?)
        `, [id])

        if (res) {
            return new Reaction(
                await User.get(res.user_id),
                await Artwork.get(res.artwork_id),
                res.liked,
                res.reaction_id
            )
        }
    }
}