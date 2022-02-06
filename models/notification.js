const { User } = require("./user")
const { random_id } = require("./util")
const db = require('./db')

class Notification {

    constructor(sender, receiver, type, detail, creation_date, id = null, viewed = false) {
        this.sender = sender
        this.receiver = receiver
        this.type = type
        this.detail = detail
        this.creation_date = creation_date
        this.viewed = viewed
        this.id = id || random_id()
    }

    save() {
        return db.run(`
            INSERT INTO notifications (
                notification_id,
                sender_id,
                receiver_id,
                type,
                detail,
                viewed,
                creation_date
            ) VALUES (?,?,?,?,?,?,?)
        `, [
            this.id,
            this.sender.id,
            this.receiver.id,
            this.type,
            this.detail,
            this.viewed,
            this.creation_date
        ])
    }

    static async get(id) {
        const res = await db.get(`
            SELECT * FROM notifications
            WHERE notification_id=?
        `, [id])

        if (res) {
            return new Notification(
                await User.get(res.sender_id),
                await User.get(res.receiver_id),
                res.type,
                res.detail,
                res.creation_date,
                res.notification_id,
                res.viewed
            )
        }
    }

    set_as_viewed() {
        return db.run(`
            UPDATE notifications
            SET viewed=?
            WHERE notification_id=?
        `, [true, this.id])
    }

}

module.exports = Notification