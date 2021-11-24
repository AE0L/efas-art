const sql3 = require('sqlite3').verbose()

class EfasArtDB {
    constructor() {
        this.name = 'efas_art'
        this.conn = new sql3.Database(`.${this.name}`, sql3.OPEN_CREATE, (err) => {
            if (err) console.error(err.message)
            console.log(`connected to ${this.name}`)
        })
    }

    get conn() {
        return this.conn
    }

    get name() {
        return this.name
    }

    close() {
        this.db.close(err => {
            if (err) console.error(err.message)
            console.log(`disconnected to ${this.name}`)
        })
    }
}

module.exports = EfasArtDB