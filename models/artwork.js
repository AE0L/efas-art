/** Artwork model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import { v4 } from 'uuid'
import db from './db'

/**
 * Artwork model class
 *
 * @memberof module:models
 */
class Artwork {
    /**
     * Creates an instance of Artwork.
     * @param {module:models.ArtCollection} art_col
     * @param {string} name
     * @param {string} tags
     * @param {string} description
     * @param {string} document
     * @param {Date} creation_date
     * @param {string} [id=null]
     */
    constructor(art_col, name, tags, description, document, creation_date, id = null) {
        this.art_col = art_col
        this.name = name
        this.tags = tags
        this.description = description
        this.document = document
        this.creation_date = creation_date
        this.id = id || Artwork.gen_id()
    }

    /**
     * Saves Artwork object into the dabatase
     *
     * @return {Promise} - sqlite's run result
     */
    save() {
        return db.run(`INSERT INTO artworks (
            artwork_id,
            art_col_id,
            name,
            tags,
            description,
            creation_date,
            document
        ) VALUES (?,?,?,?,?,?,?)`, [
            this.id,
            this.art_col.id,
            this.name,
            this.tags,
            this.description,
            this.creation_date,
            this.document
        ])
    }

    /**
     * generate a unique Artwork UUID
     *
     * @static
     * @return {string} - unique UUID 
     */
    static gen_id() {
        return `AID-${v4()}`
    }
}

export default Artwork