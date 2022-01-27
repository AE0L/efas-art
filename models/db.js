const sql3 = require('sqlite3').verbose()
const path = require('path')
const db = new sql3.Database(path.join(__dirname, './efas_art.db'))
db.get("PRAGMA foreign_keys = ON")
class Database {
    static all(stmt, params) {
        return new Promise((res, rej) => {
            db.serialize(() => {
                db.all(stmt, params, (error, result) => {
                    if (error) {
                        return rej(error.message)
                    }
                    return res(result)
                })
            })
        })
    }

    static get(stmt, params) {
        return new Promise((res, rej) => {
            db.serialize(() => {
                db.get(stmt, params, (error, result) => {
                    if (error) {
                        return rej(error.message)
                    }
                    return res(result)
                })
            })
        })
    }

    static run(stmt, params) {
        return new Promise((res, rej) => {
            db.serialize(() => {
                db.run(stmt, params, function(error) {
                    if (error) {
                        return rej(error.message)
                    }
                    return res(this)
                })
            })
        })
    }
}

module.exports = Database