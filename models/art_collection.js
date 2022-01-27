/** Art Collection model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const { google } = require('googleapis')
const gutil = require('../google')
const Artwork = require('./artwork')
const db = require('./db')
const Gallery = require('./gallery')
const { random_id } = require('./util')

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
    constructor(gallery, name, description, creation_date, id = null, col_dir = null) {
        this.gallery = gallery
        this.name = name
        this.description = description
        this.creation_date = creation_date
        this.id = id || random_id()
        this.col_dir = col_dir
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
            creation_date,
            col_dir
        ) VALUES (?,?,?,?,?,?)`, [
            this.id,
            this.gallery.id,
            this.name,
            this.description,
            this.creation_date,
            this.col_dir
        ])
    }

    update() {
        return db.run(`
            UPDATE art_collections
            SET name=?,
                description=?
            WHERE art_col_id=?
        `, [this.name, this.description, this.id])
    }

    /**
     * get specific artwork collection with an ID
     *
     * @static
     * @param {string} id
     * @return {Promise<ArtCollection>} 
     */
    static async get(id) {
        const res = await db.get(`SELECT * FROM art_collections
            WHERE art_col_id=(?)`,
            [id]
        )

        if (res) {
            return new ArtCollection(
                await Gallery.get(res.gallery_id),
                res.name,
                res.description,
                res.creation_date,
                res.art_col_id,
                res.col_dir
            )
        }
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
                [this.id]
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

    async gen_col_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })
        const meta = {
            name: this.id,
            mimeType: gutil.constants.mime.folder,
            parents: [this.gallery.art_col_dir]
        }
        const res = await gd.files.create({
            resource: meta,
            fields: 'id'
        })

        this.col_dir = res.data.id
    }

    remove() {
        return db.run(`
            DELETE FROM art_collections
            WHERE art_col_id=?
        `, [this.id])
    }

    remove_dir() {
        const gd = google.drive({ version: 'v3', auth: global.gauth })

        return gd.files.delete({
            fileId: this.col_dir
        })
    }

}

module.exports = ArtCollection