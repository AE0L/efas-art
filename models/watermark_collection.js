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
import Gallery from './gallery'
import { google } from 'googleapis'
import gutil from '../google'

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
            description,
            creation_date,
            col_dir
        ) VALUES (?,?,?,?,?,?)`, [
            this.id,
            this.gallery.id,
            this.name,
            this.description,
            this.creation_date,
            this.col_dir
        ])
    }

    /**
     * get specific waatermark collection with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<WatermarkCollection>} 
     */
    static async get(id) {
        const res = await db.get(`SELECT * FROM watermark_collections
            WHERE watermark_col_id=(?)`,
            [id]
        )

        if (res) {
            return new WatermarkCollection(
                await Gallery.get(res.gallery_id),
                res.name,
                res.description,
                res.creation_date,
                res.watermark_col_id
            )
        }

    }

    /**
     * @type {Promise<Array<Watermark>>}
     */
    get watermarks() {
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

    async gen_col_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })
        const meta = {
            name: this.id,
            mimeType: gutil.constants.mime.folder,
            parents: [this.gallery.watermark_col_dir]
        }
        const res = await gd.files.create({
            resource: meta,
            fields: 'id'
        })

        this.col_dir = res.data.id
    }

    /**
     * Generate a unique watermark collection UID
     *
     * @static
     * @return {string} - unique UID 
     */
    static gen_id() {
        return random_id()
    }
}

export default WatermarkCollection