import path from 'path'
const sql3 = require('sqlite3').verbose()
const db = new sql3.Database(path.resolve(__dirname, './efas_art.db'))

export default class {
    static all(stmt, params) {
        return new Promise((res, rej) => {
            db.all(stmt, params, (error, result) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        })
    }

    static get(stmt, params) {
        return new Promise((res, rej) => {
            db.get(stmt, params, (error, result) => {
                if (error) {
                    return rej(error.message);
                }
                return res(result);
            });
        })
    }

    static run(stmt, params) {
        return new Promise((res, rej) => {
            db.serialize(() => {
                db.run(stmt, params, (error, result) => {
                    if (error) {
                        return rej(error.message);
                    }
                    return res(result);
                });
            })
        })
    }
}