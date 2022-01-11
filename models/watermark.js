/** Watermark model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import db from './db'
import random_id from './util'
import WatermarkCollection from './watermark_collection'

/**
 * Watermark model class
 *
 * @class
 */
class Watermark {
    /**
     * Creates an instance of Watermark.
     * 
     * @param {WatermarkCollection} watermark_col
     * @param {string} name
     * @param {string} document
     * @param {Date} creation_date
     * @param {string} [id=null]
     */
    constructor(watermark_col, name, document, creation_date, id = null) {
        this.watermark_col = watermark_col
        this.name = name
        this.document = document
        this.creation_date = creation_date
        this.id = id || Watermark.gen_id()
    }

    /**
     * Save Watermark object into the database
     *
     * @return {Promise} - sqlite's run result 
     */
    save() {
        return db.run(`INSERT INTO watermarks (
            watermark_id,
            watermark_col_id, 
            name, 
            document,
            creation_date
        ) VALUES (?,?,?,?)`, [
            this.id,
            this.watermark_col.id,
            this.name,
            this.document,
            this.creation_date
        ])
    }

    /**
     * get specific watermark with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<Watermark} 
     */
    static async get(id) {
        const res = db.get(`SELECT * FROM watermarks
            WHERE watermark_id=(?)`,
            [id]
        )

        if (res) {
            return new Watermark(
                WatermarkCollection.get(res.watermark_col_id),
                res.name,
                res.document,
                res.creation_date,
                res.watermark_id
            )
        }
    }

    /**
     * Generate a unique watermark UID
     *
     * @static
     * @return {string} - unique UID 
     */
    static gen_id() {
        return random_id()
    }
}

export default Watermark