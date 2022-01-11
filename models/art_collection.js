/** Art Collection model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import Artwork from './artwork'
import db from './db'
import Gallery from './gallery'
import random_id from './util'

/** 
 * Art Collection model class 
 * 
 * @class
 */
class ArtCollection {

    /**
     * Creates an instance of ArtCollection.
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
        this.id = id || ArtCollection.gen_id()
    }

    /**
     * save the Art Collection object in to the database
     *
     * @return {Promise} - sqlite's run result
     */
    save() {
        return db.run(`INSERT INTO art_collections (
            art_col_id,
            gallery_id,
            name,
            description,
            creation_date
        ) VALUES (?,?,?,?,?)`, [
            this.id,
            this.gallery.id,
            this.name,
            this.description,
            this.creation_date
        ])
    }

    /**
     * get specific artwork collection with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<ArtCollection>} 
     */
    static async get(id) {
        const res = await db.get(`SELECT * FROM art_collection
            WHERE art_col_id=(?)`,
            [id]
        )

        if (res) {
            return new ArtCollection(
                Gallery.get(res.gallery_id),
                res.name,
                res.description,
                res.creation_date,
                res.art_col_id
            )
        }
    }

    /**
     * get art collection's ID
     *
     * @readonly
     * @type {string}
     */
    get id() {
        return this.id.replace('ACID-', '')
    }

    /**
     * Get all the artworks in this collection
     *
     * @type {Promise<Array<Artwork>>}
     */
    get artworks() {
        return (async () => {
            const rows = await db.all(`SELECT * FROM artworks 
                WHERE art_col_id=(?)
                ORDER BY creation_date`,
                [art_col_id]
            )
            let arts = []

            for (let row of rows) {
                arts.push(new Artwork(
                    this,
                    row.name,
                    row.tags,
                    row.description,
                    row.document,
                    row.creation_date,
                    row.artwork_id
                ))
            }

            return arts
        })()
    }

    /**
     * Generate a unique art collection UID
     *
     * @static
     * @return {string} - unique UID 
     */
    static gen_id() {
        return random_id()
    }
}

export default ArtCollection