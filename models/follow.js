const db = require('./db')
const { random_id } = require('./util')
class Follow {

    constructor(user, followed, follow_date, id = null) {
        this.user = user
        this.followed = followed
        this.follow_date = follow_date
        this.id = id || random_id()
    }

    async save() {
        return db.run(`INSERT INTO follows (
            follow_id,
            user_id,
            followed_id,
            follow_date
        ) VALUES (?,?,?,?)`, [
            this.id,
            this.user.id,
            this.followed.id,
            this.follow_date
        ])
    }

    static async get(user, followed) {
        const { User } = require('./user')
        const res = await db.get(`
            SELECT * FROM follows
            WHERE user_id=(?) AND followed_id=(?)
        `, [user.id, followed.id])

        if (res) {
            return new Follow(
                await User.get(res.user_id),
                await User.get(res.followed_id),
                res.follow_date,
                res.follow_id
            )
        }
    }

    async delete() {
        return db.run(`
            DELETE FROM follows
            WHERE user_id=(?) AND followed_id=(?)
        `, [this.user.id, this.followed.id])
    }

}

module.exports = Follow