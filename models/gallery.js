/** Gallery model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import ArtCollection from './art_collection'
import db from './db'
import User from './user'
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
    constructor(user, id = null) {
        this.user = user
        this.id = id || Gallery.gen_id()
    }

    /**
     * Saves the Gallery object to the database
     *
     * @return {Promise} - sqlite's run result
     */
    save() {
        return db.run(
            `INSERT INTO galleries (gallery_id, user_id) VALUES (?, ?)`,
            [this.id, this.user.id]
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
        const res = db.get(`SELECT * FROM galleries
            WHERE gallery_id=(?)`,
            [id]
        )

        if (res) {
            return new Gallery(
                User.get(res.user_id),
                res.gallery_id
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
            const rows = await db.all(`SELECT * FROM art_collection
                WHERE gallery_id=(?)`,
                [this.id]
            )
            let collections = []

            for (let row of rows) {
                collections.push(new ArtCollection(
                    this,
                    row.name,
                    row.description,
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
            const stmt = `SELECT * FROM watermark_collections WHERE gallery_id=(?)`
            const params = [this.id]
            const rows = await db.all(stmt, params)
            let collections = []

            for (let row of rows) {
                collections.push(new WatermarkCollection(this, row.name, row.description, row.watermark_id))
            }

            return collections
        })()
    }

    /**
     * generate a unique gallery UID
     *
     * @static
     * @return {string} - unique gallery UID 
     */
    static gen_id() {
        return `GID-${random_id()}`
    }
}

export default Gallery