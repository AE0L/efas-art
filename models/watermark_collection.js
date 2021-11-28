// TODO documentation
import { v4 } from 'uuid'
import db from './db'
import Watermark from './watermark'

export default class WatermarkCollection {
    constructor(gallery, name, description, id = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.id = id || WatermarkCollection.gen_id()
    }

    save() {
        const stmt = `INSERT INTO watermark_collections (watermark_col_id, gallery_id, name, description) VALUES (?,?,?,?)`
        const params = [this.id, this.gallery.id, this.name, this.description]

        return db.run(stmt, params)
    }

    async get watermaks() {
        const stmt = `SELECT * FROM watermarks WHERE watermark_col_id='(?)'`
        const params = [this.id]
        const rows = await db.all(stmt, params)
        let watermarks = []

        for (let row of rows) {
            watermarks.push(new Watermark(this, row.name, row.document, row.id))
        }

        return watermarks
    }

    async get watermark(watermark_id) {
        const stmt = `SELECT * FROM watermark WHERE watermark_id='(?)'`
        const params = [watermark_id]
        const res = await db.get(stmt, params)

        if (res) {
            return new Watermark(this, res.name, res.document, res.watermark_id)
        }

        return null
    }

    static gen_id() {
        return `WCID-${v4()}`
    }
}