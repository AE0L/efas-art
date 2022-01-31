/** Watermark model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const { google } = require('googleapis')
const fs = require('fs')
const db = require('./db')
const { random_id } = require('./util')

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
    constructor(watermark_col, name, creation_date, id = null, document = null) {
        this.watermark_col = watermark_col
        this.name = name
        this.creation_date = creation_date
        this.id = id || random_id()
        this.document = document
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
        ) VALUES (?,?,?,?,?)`, [
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
        const WatermarkCollection = require('./watermark_collection')

        const res = await db.get(`SELECT * FROM watermarks
            WHERE watermark_id=(?)`,
            [id]
        )

        if (res) {
            return new Watermark(
                await WatermarkCollection.get(res.watermark_col_id),
                res.name,
                res.creation_date,
                res.watermark_id,
                res.document
            )
        }
    }

    async update() {
        return db.run(`
            UPDATE watermarks
            SET name=?
            WHERE watermark_id=?
        `, [
            this.name,
            this.description,
            this.tags,
            this.id
        ])
    }

    async upload(path, col_dir) {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        const res = await gd.files.create({
            resource: {
                name: `${this.id}.png`,
                parents: [col_dir]
            },
            media: {
                mimeType: 'image/png',
                body: fs.createReadStream(path)
            },
            fields: 'id'
        })

        this.document = res.data.id
    }

    async remove() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        await gd.files.delete({
            fileId: this.document
        })

        return db.run(`
            DELETE FROM watermarks
            WHERE watermark_id=?
        `, [this.id])
    }
}

module.exports = Watermark