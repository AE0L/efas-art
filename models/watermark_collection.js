/** Watermark Collection model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import db from './db'
import Watermark from './watermark'

/**
 * Watermark Collection model class
 *
 * @class
 * @memberof module:models
 */
class WatermarkCollection {
    /**
     * Creates an instance of WatermarkCollection.
     * 
     * @param {module:models.Gallery} gallery
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
     * @type {array<module:models.Watermark>}
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
     * Get specific watermark with a watermark UUID
     *
     * @param {string} - watermark UUID to be queried
     * @returns {module:models.Watermark}
     */
    get_watermark(id) {
        return (async () => {
            const res = await db.get(`SELECT * FROM watermark
                WHERE watermark_id=(?)`,
                [id]
            )

            if (res) {
                return new Watermark(
                    this,
                    res.name,
                    res.document,
                    res.creation_date,
                    res.watermark_id
                )
            }

            return null
        })()
    }

    /**
     * Generate a unique watermark collection UUID
     *
     * @static
     * @return {string} - unique UUID 
     */
    static gen_id() {
        return `WCID-${v4()}`
    }
}

export default WatermarkCollection