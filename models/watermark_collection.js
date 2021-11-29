/** Watermark Collection model
 * 
 * @module models/
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
 * @export
 * @class WatermarkCollection
 */
export default class WatermarkCollection {
    /**
     * Creates an instance of WatermarkCollection.
     * 
     * @param {Gallery} gallery
     * @param {string} name
     * @param {string} description
     * @param {string} [id=null]
     * @memberof WatermarkCollection
     */
    constructor(gallery, name, description, id = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.id = id || WatermarkCollection.gen_id()
    }

    /**
     * Saves WatermarkCollection object into the database
     *
     * @return {Promise} - sqlite's run result 
     * @memberof WatermarkCollection
     */
    save() {
        const stmt = `INSERT INTO watermark_collections (watermark_col_id, gallery_id, name, description) VALUES (?,?,?,?)`
        const params = [this.id, this.gallery.id, this.name, this.description]

        return db.run(stmt, params)
    }

    /**
     * Get all watermarks in the collection
     *
     * @returns {array<Watermark>} - all the watermarks in this collection
     * @memberof WatermarkCollection
     */
    get watermaks() {
        return (async () => {
            const stmt = `SELECT * FROM watermarks WHERE watermark_col_id='(?)'`
            const params = [this.id]
            const rows = await db.all(stmt, params)
            let watermarks = []

            for (let row of rows) {
                watermarks.push(new Watermark(this, row.name, row.document, row.id))
            }

            return watermarks
        })()
    }

    /**
     * Get specific watermark with a watermark UUID
     *
     * @param {string} - watermark UUID to be queried
     * @returns {Watermark}
     * @memberof WatermarkCollection
     */
    get_watermark(watermark_id) {
        return (async () => {
            const stmt = `SELECT * FROM watermark WHERE watermark_id='(?)'`
            const params = [watermark_id]
            const res = await db.get(stmt, params)

            if (res) {
                return new Watermark(this, res.name, res.document, res.watermark_id)
            }

            return null
        })()
    }

    /**
     * Generate a unique watermark collection UUID
     *
     * @static
     * @return {string} - unique UUID 
     * @memberof WatermarkCollection
     */
    static gen_id() {
        return `WCID-${v4()}`
    }
}