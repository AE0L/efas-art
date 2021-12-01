/** Watermark Collection model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import db from './db'
import Watermark from './watermark'
import random_id from './util'

/**
 * Watermark Collection model class
 *
 * @class
 */
class WatermarkCollection {
    /**
     * Creates an instance of WatermarkCollection.
     * 
     * @param {Gallery} gallery
     * @param {string} name
     * @param {string} description
     * @param {Date} creation_date
     * @param {string} [id=null]
     */
    constructor(gallery, name, description, creation_date, id = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.creation_date = creation_date
        this.id = id || WatermarkCollection.gen_id()
    }

    /**
     * Saves WatermarkCollection object into the database
     *
     * @return {Promise} - sqlite's run result 
     */
    save() {
        return db.run(`INSERT INTO watermark_collections (
            watermark_col_id,
            gallery_id,
            name,
            description
        ) VALUES (?,?,?,?)`, [
            this.id,
            this.gallery.id,
            this.name,
            this.description
        ])
    }

    /**
     * Get all watermarks in the collection
     *
     * @type {Promise<Array<Watermark>>}
     */
    get watermaks() {
        return (async () => {
            const rows = await db.all(`SELECT * FROM watermarks
                WHERE watermark_col_id=(?)
                ORDER BY creation_date`,
                [this.id]
            )
            let watermarks = []

            for (let row of rows) {
                watermarks.push(new Watermark(
                    this,
                    row.name,
                    row.document,
                    row.creation_date,
                    row.watermark_id
                ))
            }

            return watermarks
        })()
    }

    /**
     * Generate a unique watermark collection UUID
     *
     * @static
     * @return {string} - unique UUID 
     */
    static gen_id() {
        return random_id('WCID')
    }
}

export default WatermarkCollection