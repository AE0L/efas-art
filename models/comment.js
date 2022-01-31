const Artwork = require('./artwork')
const db = require('./db')
const { random_id } = require('./util')

class Comment {

    constructor(user, artwork, comment_text, comment_date, id = null) {
        this.user = user
        this.artwork = artwork
        this.comment_text = comment_text
        this.comment_date = comment_date
        this.id = id || random_id()
    }

    async save() {
        return db.run(`
            INSERT INTO comments (
                comment_id,
                user_id,
                artwork_id,
                comment_text,
                comment_date
            ) VALUES (?,?,?,?,?)
        `, [
            this.id,
            this.user.id,
            this.artwork.id,
            this.comment_text,
            this.comment_date
        ])
    }

    static async get(id) {
        const res = await db.get(`
            SELECT * FROM comments
            WHERE comment_id=(?)
        `, [id])

        if (res) {
            const comment = new Comment(
                await User.get(res.user_id),
                await Artwork.get(res.artwork_id),
                res.comment_text,
                res.comment_date,
                res.comment_id
            )

            return comment
        }
    }

}

module.exports = Comment