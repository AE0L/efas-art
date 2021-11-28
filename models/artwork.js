// TODO documentation
import { v4 } from 'uuid'
import db from './db'

export default class Artwork {
    constructor(art_col, name, tags, description, document, id = null) {
        this.art_col = art_col
        this.name = name
        this.tags = tags
        this.description = description
        this.document = document
        this.id = id || Artwork.gen_id()
    }

    save() {
        const stmt = `INSERT INTO artworks (artwork_id, art_col_id, name, tags, description, document) VALUES (?,?,?,?,?,?)`
        const params = [this.id, this.art_col.id, this.name, this.tags, this.description, this.document]

        return db.run(stmt, params)
    }

    static gen_id() {
        return `AID-${v4()}`
    }
}