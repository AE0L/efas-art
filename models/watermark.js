/** Watermark model
 * 
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
 * @class
 * @memberof module:models
 */
class Watermark {
    /**
     * Creates an instance of Watermark.
     * 
     * @param {module:models.Watermark} watermark_col
     * @param {string} name
     * @param {string} document
     * @param {string} [id=null]
     */
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
     */
    static gen_id() {
        return `WID-${v4()}`
    }
}

export default Watermark