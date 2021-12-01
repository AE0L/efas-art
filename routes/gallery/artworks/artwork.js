import express from 'express'
import Artwork from '../../../models/artwork'
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
        const col = art.art_col
        const gallery = col.gallery
        const user = gallery.user

        return res.render('user/artwork', {
            user: user,
            colection: col,
            artwork: art
        })
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

module.exports = router