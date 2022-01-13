/** Gallery model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { google } from 'googleapis'
import gutil from '../google'
import ArtCollection from './art_collection'
import db from './db'
import User from './user'
import random_id from './util'
import WatermarkCollection from './watermark_collection'

/**
 * Gallery model class
 *
 * @class
 */
class Gallery {
    /**
     * Creates an instance of Gallery.
     * 
     * @param {User} user
     * @param {string} [id=null]
     */
    constructor(user, id = null, art_col_dir = null, watermark_col_dir = null) {
        this.user = user
        this.id = id || random_id()
        this.art_col_dir = art_col_dir
        this.watermark_col_dir = watermark_col_dir
    }

    /**
     * Saves the Gallery object to the database
     *
     * @return {Promise} - sqlite's run result
     */
    save() {
        return db.run(
            `INSERT INTO galleries (
                gallery_id,
                user_id,
                art_col_dir,
                watermark_col_dir
            ) VALUES (?,?,?,?)`, [
                this.id,
                this.user.id,
                this.art_col_dir,
                this.watermark_col_dir
            ]
        )
    }

    /**
     * get a specific gallery with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<Gallery>} 
     */
    static async get(id) {
        const res = await db.get(`SELECT * FROM galleries
            WHERE gallery_id=(?)`,
            [id]
        )

        if (res) {
            return new Gallery(
                await User.get(res.user_id),
                res.gallery_id,
                res.art_col_dir,
                res.watermark_col_dir
            )
        }
    }

    /**
     * Get all the art collections in the user's gallery
     *
     * @type {Promise<Array<ArtCollection>>}
     */
    get art_collections() {
        return (async () => {
            const rows = await db.all(`SELECT * FROM art_collections
                WHERE gallery_id=(?)`,
                [this.id]
            )
            let collections = []

            for (let row of rows) {
                collections.push(new ArtCollection(
                    this,
                    row.name,
                    row.description,
                    row.creation_date,
                    row.art_col_id
                ))
            }

            return collections
        })()
    }

    /**
     * Get all the watermark collections in the user's gallery
     *
     * @type {Promise<Array<WatermarkCollection>>}
     */
    get watermark_collections() {
        return (async () => {
            const rows = await db.all(`SELECT * FROM watermark_collections
                WHERE gallery_id=(?)`,
                [this.id]
            )
            let collections = []

            for (let row of rows) {
                collections.push(new WatermarkCollection(
                    this,
                    row.name,
                    row.description,
                    row.creation_date,
                    row.watermark_col_id
                ))
            }

            return collections
        })()
    }

    async gen_art_col_dir(root_dir) {
        const gd = google.drive({ version: 'v3', auth: global.gauth })
        const meta = {
            name: 'ART_COLLECTIONS',
            mimeType: gutil.constants.mime.folder,
            parents: [root_dir]
        }

        const res = await gd.files.create({
            resource: meta,
            fields: 'id'
        })

        this.art_col_dir = res.data.id
    }

    async gen_watermark_col_dir(root_dir) {
        const gd = google.drive({ version: 'v3', auth: global.gauth })
        const meta = {
            name: 'WATERMARK_COLLECTIONS',
            mimeType: gutil.constants.mime.folder,
            parents: [root_dir]
        }

        const res = await gd.files.create({
            resource: meta,
            fields: 'id'
        })

        this.watermark_col_dir = res.data.id
    }
}

export default Gallery