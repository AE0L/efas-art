// TODO documentation
import { v4 } from 'uuid'
import db from './db'
import Artwork from './artwork'

export default class ArtCollection {
    SAVE_STMT = `INSERT INTO art_collections (art_col_id,gallery_id,name,description) VALUES (?,?,?,?)`

    constructor(gallery, name, description, id = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.id = id || ArtCollection.gen_id()
    }

    save() {
        const params = [this.id, this.gallery.id, this.name, this.description]

        return db.run(this.SAVE_STMT, params)
    }

    static get artworks() {
        const stmt = `SELCT * FROM artworks WHERE art_col_id='(?)'`
        const params = [art_col_id]

        const rows = db.all(stmt, params)
        let collections = []

        for (let row of rows) {
            collections.push(new Artwork(this, row.name, row.tags, row.description, row.document, row.artwork_id))
        }

        return collections
    }

    static get artwork(artwork_id) {
        const stmt = `SELECT * FROM artworks WHERE artwork_id='(?)'`
        const params = [artwork_id]

        const res = await db.get(stmt, params)

        if (res) {
            return new Artwork(this, res.name, res.tags, res.description, res.document, res.artwork_id)
        }

        return null
    }

    static gen_id() {
        return `ACID-${v4()}`
    }
}