/** Watermark model
 * 
 * @module models/
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import db from './db'

/**
 * Watermark model class
 *
 * @export
 * @class Watermark
 */
export default class Watermark {
    constructor(watermark_col, name, document, id = null) {
        this.watermark_col = watermark_col
        this.name = name
        this.document = document
        this.id = id || Watermark.gen_id()
    }

    /**
     * Save Watermark object into the database
     *
     * @return {Promise} - sqlite's run result 
     * @memberof Watermark
     */
    save() {
        const stmt = `INSERT INTO watermarks (watermark_id, watermark_col_id, name, document) VALUES (?,?,?,?)`
        const params = [this.id, this.watermark_col.id, this.name, this.document]

        return db.run(stmt, params)
    }

    /**
     * Generate a unique watermark UUID
     *
     * @static
     * @return {string} - unique UUID 
     * @memberof Watermark
     */
    static gen_id() {
        return `WID-${v4()}`
    }
}