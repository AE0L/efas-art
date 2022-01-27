/** Watermark Collection model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const { google } = require('googleapis')
const gutil = require('../google')
const db = require('./db')
const Gallery = require('./gallery')
const { random_id } = require('./util')
const Watermark = require('./watermark')

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
    constructor(gallery, name, description, creation_date, id = null, col_dir = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.creation_date = creation_date
        this.id = id || random_id()
        this.col_dir = col_dir
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

    update() {
        return db.run(`
            UPDATE watermark_collections
            SET name=?,
                description=?
            WHERE watermark_col_id=?
        `, [this.name, this.description, this.id])
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
                res.watermark_col_id,
                res.col_dir
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
                    row.creation_date,
                    row.watermark_id,
                    row.document
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

    remove() {
        return db.run(`
            DELETE FROM watermark_collections
            WHERE watermark_col_id=?
        `, [this.id])
    }

    remove_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        return gd.files.delete({
            fileId: this.col_dir
        })
    }
}

module.exports = WatermarkCollection