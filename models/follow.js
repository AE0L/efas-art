import db from './db'
import User from './user'
import random_id from './util'

class Follow {
    constructor(user, followed, followed_date, id = null) {
        this.user = user
        this.followed = followed
        this.followed_date = followed_date
        this.id = id || random_id()
    }

    async save() {
        return db.run(`INSERT INTO follows (
            follow_id,
            user_id,
            followed_id,
            followed_date
        ) VALUES (?,?,?,?)`, [
            this.id,
            this.user.id,
            this.followed.id,
            this.followed_date
        ])
    }

    static async get(id) {
        const res = await db.get(`
            SELECT * FROM follows
            WHERE follow_id=(?)
        `, [id])

        if (res) {
            const follow = new Follow(
                await User.get(res.user_id),
                await User.get(res.followed_id),
                res.followed_date,
                res.follow_id
            )

            return follow
        }
    }
}

export default Follow