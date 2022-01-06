import express from 'express'
import Artwork from '../../../models/artwork'
import google from '../../../google'
import ArtCollection from '../../../models/art_collection'
import multer from 'multer'
const upload = multer({ dest: 'uploads/temp/artwork' })
const router = express.Router()

/**
 * @swagger
 * /artwork/{artwork_id}:
 *   get:
 *     summary: get specific artwork
 *     parameters:
 *       - name: artwork_id      
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:artwork_id', async (req, res) => {
    let artwork_id = `AID-${req.params.artwork_id}`

    try {
        const art = await Artwork.get(artwork_id)

        if (art) {
            const col = art.art_col
            const gallery = col.gallery
            const user = gallery.user

            return res.render('user/artwork/item', {
                user: user,
                colection: col,
                artwork: art
            })
        }
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

router.get('/upload/:col_id', (req, res) => {
    res.render('tests/upload_artwork')
})

router.post('/upload/:col_id', upload.single('artwork_file'), async (req, res) => {
    const { col_id } = req.params
    const { name, tags, description } = req.body
    const file = req.file

    try {
        const col = ArtCollection.get(col_id)
        const art = new Artwork(col, name, tags, description, Date.now(), file.originalname)
    } catch (error) {
        console.error(error)
        res.status(404).end()
    }
})

module.exports = router