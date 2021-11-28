/** Gallery model
 * 
 * @module models/
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import ArtCollection from './art_collection'
import WatermarkCollection from './watermark_collection'
import db from './db'

/**
 * Gallery model class
 *
 * @export
 * @class Gallery
 */
export default class Gallery {
    /**
     * Creates an instance of Gallery.
     * 
     * @param {User} user
     * @memberof Gallery
     */
    constructor(user, id = null) {
        this.user = user
        this.id = id || Gallery.gen_id()
    }

    /**
     * Saves the Gallery object to the database
     *
     * @return {Promise} - sqlite's run result
     * @memberof Gallery
     */
    save() {
        const stmt = `INSERT INTO galleries (gallery_id, user_id) VALUES (?, ?)`
        const params = [this.id, this.user.id]

        return db.run(stmt, params)
    }

    /**
     * Get all the art collections in the user's gallery
     *
     * @returns {array<ArtCollection>} - all the artwork collection in the gallery
     * @memberof Gallery
     */
    async get art_collections() {
        const stmt = `SELECT * FROM art_collection WHERE gallery_id=(?)`
        const params = [this.id]
        const rows = await db.all(stmt, params)
        let collections = []

        for (let row of rows) {
            collections.push(new ArtCollection(this, row.name, row.description, row.art_col_id))
        }

        return collections
    }

    /**
     * Get all the watermark collections in the user's gallery
     *
     * @returns {array<WatermarkCollection>} - all the watermark collection in the gallery
     * @memberof Gallery
     */
    async get watermark_collections() {
        const stmt = `SELECT * FROM watermark_collections WHERE gallery_id='(?)'`
        const params = [this.id]
        const rows = await db.all(stmt, params)
        let collections = []

        for (let row of rows) {
            collections.push(new WatermarkCollection(this, row.name, row.description, row.watermark_id))
        }

        return collections
    }

    /**
     * generate a unique gallery UUID
     *
     * @static
     * @return {string} - unique gallery UUID 
     * @memberof Gallery
     */
    static gen_id() {
        return `GID-${v4()}`
    }
}