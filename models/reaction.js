const db = require('./db')
const { random_id } = require('./util')

class Reaction {
    constructor(user, artwork, id = null, liked = false) {
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

    static async get(user, art) {
        const { User } = require('./user')
        const Artwork = require('./artwork')

        const res = await db.get(`
            SELECT * FROM reactions
            WHERE user_id=(?) AND artwork_id=(?)
        `, [user.id, art.id])

        if (res) {
            return new Reaction(
                await User.get(res.user_id),
                await Artwork.get(res.artwork_id),
                res.reaction_id,
                res.liked
            )
        } else {
            const reaction = new Reaction(user, art)

            await reaction.save()

            return reaction
        }
    }

    async like() {
        return db.run(`
            UPDATE reactions
            SET liked=?
            WHERE reaction_id=?
        `, [true, this.id])
    }

    async unlike() {
        return db.run(`
            UPDATE reactions
            SET liked=?
            WHERE reaction_id=?
        `, [false, this.id])
    }
}

module.exports = Reaction