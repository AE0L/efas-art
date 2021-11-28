/** Art Collection model
 * @module models/
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import db from './db'
import Artwork from './artwork'

/**
 * Art Collection model class
 *
 * @export
 * @class ArtCollection
 */
export default class ArtCollection {
    SAVE_STMT = `INSERT INTO art_collections (art_col_id,gallery_id,name,description) VALUES (?,?,?,?)`

    /**
     * Creates an instance of ArtCollection.
     * @param {Gallery} gallery
     * @param {string} name
     * @param {string} description
     * @param {string} [id=null]
     * @memberof ArtCollection
     */
    constructor(gallery, name, description, id = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.id = id || ArtCollection.gen_id()
    }

    /**
     * save the Art Collection object in to the database
     *
     * @return {Promise} - sqlite's run result
     * @memberof ArtCollection
     */
    save() {
        const params = [this.id, this.gallery.id, this.name, this.description]

        return db.run(this.SAVE_STMT, params)
    }

    /**
     * Get all the artworks in this collection
     *
     * @return {array<Artwork>}
     * @memberof ArtCollection
     */
    async get artworks() {
        const stmt = `SELCT * FROM artworks WHERE art_col_id='(?)'`
        const params = [art_col_id]
        const rows = await db.all(stmt, params)
        let collections = []

        for (let row of rows) {
            collections.push(new Artwork(this, row.name, row.tags, row.description, row.document, row.artwork_id))
        }

        return collections
    }

    /**
     * Get specific artwork using an artwork UUID
     *
     * @return {Artwork}
     * @memberof ArtCollection
     */
    async get artwork(artwork_id) {
        const stmt = `SELECT * FROM artworks WHERE artwork_id='(?)'`
        const params = [artwork_id]
        const res = await db.get(stmt, params)

        if (res) {
            return new Artwork(this, res.name, res.tags, res.description, res.document, res.artwork_id)
        }

        return null
    }

    /**
     * Generate a unique art collection UUID
     *
     * @static
     * @memberof ArtCollection
     * @return {string} - unique UUID 
     */
    static gen_id() {
        return `ACID-${v4()}`
    }
}