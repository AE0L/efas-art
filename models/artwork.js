/** Artwork model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import ArtCollection from './art_collection'
import Comment from './comment'
import db from './db'
import random_id from './util'

/**
 * Artwork model class
 * 
 * @class
 */
class Artwork {
    /**
     * Creates an instance of Artwork.
     * @param {ArtCollection} art_col
     * @param {string} name
     * @param {string} tags
     * @param {string} description
     * @param {string} document
     * @param {Date} creation_date
     * @param {string} [id=null]
     */
    constructor(art_col, name, tags, description, creation_date, document, id = null) {
        this.art_col = art_col
        this.name = name
        this.tags = tags
        this.description = description
        this.document = document
        this.creation_date = creation_date
        this.id = id || random_id()
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
     * get specific artwork with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<Artwork>} 
     */
    static async get(id) {
        const res = db.get(`SELECT * FROM artworks
            WHERE artwork_id=(?)`,
            [id]
        )

        if (res) {
            return new Artwork(
                ArtCollection.get(res.art_col_id),
                res.name,
                res.tags,
                res.description,
                res.document,
                res.creation_date,
                res.artwork_id
            )
        }
    }

    async get_comments() {
        const rows = await db.get(`
            SELECT * FROM comments
            WHERE artwork_id=(?)
        `, [this.id])

        const comments = []

        for (let row of rows) {
            comments.push(new Comment(
                await User.get(row.user_id),
                this,
                row.comment_text,
                row.comment_date,
                row.comment_id
            ))
        }

        return comments
    }

    async is_liked(user) {
        const res = await db.get(`
            SELECT * FROM reactions
            WHERE artwork_id=(?) AND user_id=(?)
        `, [this.id, user.id])

        return res ? res.liked : false
    }
}

export default Artwork