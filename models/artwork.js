/** Artwork model
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import ArtCollection from './art_collection'
import { access_drive, upload_files } from '../google'
import { file_extension, mime_type } from '../utils/index'
import fs from 'fs'
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
        this.id = id || Artwork.gen_id()
    }

    async store(tmp_path) {
        const ext = file_extension(this.document)
        const res = access_drive(global.gauth, upload_files, [{
            metadata: {
                name: `${this.id}.${ext}`
            },
            media: {
                mimeType: mime_type(ext),
                body: fs.createReadStream(tmp_path)
            }
        }])
    }

    /**
     * Saves Artwork object into the dabatase
     *
     * @return {Promise} - sqlite's run result
     */
    save() {
        const res = db.run(`INSERT INTO artworks (
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

    /**
     * generate a unique Artwork UID
     *
     * @static
     * @return {string} - unique UID 
     */
    static gen_id() {
        return random_id('AID')
    }
}

export default Artwork