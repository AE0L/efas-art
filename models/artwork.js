/** Artwork model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const ArtCollection = require('./art_collection')
const Comment = require('./comment')
const db = require('./db')
const { random_id } = require('./util')
const { google } = require('googleapis')
const fs = require('fs')

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
    constructor(art_col, name, tags, description, creation_date, id = null, document = null) {
        this.art_col = art_col
        this.name = name
        this.tags = tags
        this.description = description
        this.creation_date = creation_date
        this.id = id || random_id()
        this.document = document
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
            document,
            creation_date
        ) VALUES (?,?,?,?,?,?,?)`, [
            this.id,
            this.art_col.id,
            this.name,
            this.tags,
            this.description,
            this.document,
            this.creation_date
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
                res.creation_date,
                res.artwork_id,
                res.document
            )
        }
    }

    async get_comments() {
        const rows = await db.all(`
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

    async upload(path, col_dir) {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        const res = await gd.files.create({
            resource: {
                name: `${this.id}.jpg`,
                parents: [col_dir]
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(path)
            },
            fields: 'id'
        })

        this.document = res.data.id
    }
}

module.exports = Artwork