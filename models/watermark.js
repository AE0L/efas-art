// TODO documentation
import { v4 } from 'uuid'
import db from './db'

export default class Watermark {
    constructor(watermark_col, name, document, id = null) {
        this.watermark_col = watermark_col
        this.name = name
        this.document = document
        this.id = id || Watermark.gen_id()
    }

    save() {
        const stmt = `INSERT INTO watermarks (watermark_id, watermark_col_id, name, document) VALUES (?,?,?,?)`
        const params = [this.id, this.watermark_col.id, this.name, this.document]

        return db.run(stmt, params)
    }

    static gen_id() {
        return `WID-${v4()}`
    }
}