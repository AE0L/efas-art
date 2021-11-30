/** Art Collection model
 * 
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
 * @class
 * @memberof module:models
 */
class ArtCollection {

    /**
     * Creates an instance of ArtCollection.
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
     * Get all the artworks in this collection
     *
     * @type {Array<module:models.Artwork>}
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
     * Get specific artwork using an artwork UUID
     *
     * @return {module:models.Artwork}
     */
    get_artwork(id) {
        return (async () => {
            const res = await db.get(`SELECT * FROM artworks
                WHERE artwork_id=(?)`,
                [id]
            )

            if (res) {
                return new Artwork(
                    this,
                    res.name,
                    res.tags,
                    res.description,
                    res.document,
                    res.creation_date,
                    res.artwork_id
                )
            }

            return null
        })()
    }

    /**
     * Generate a unique art collection UUID
     *
     * @static
     * @return {string} - unique UUID 
     */
    static gen_id() {
        return `ACID-${v4()}`
    }
}

/** @module models */
export default ArtCollection