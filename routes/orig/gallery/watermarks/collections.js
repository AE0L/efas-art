import express from 'express'
import User from '../../../models/user'
import WatermarkCollection from '../../../models/watermark_collection'
const router = express.Router()

/**
 * @swagger
 * /watermark/collections/{user_id}:
 *   get:
 *     summary: get all user's watermark collections
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/collections/:user_id', async (req, res) => {
    const user_id = `UID-${req.params.user_id}`

    try {
        const user = await User.get(user_id)

        if (user) {
            const gallery = await user.gallery
            const watermark_cols = await gallery.watermark_collections

            res.render('user/watermark/collections', {
                user: user,
                collections: watermark_cols
            })
        }

        return res.send({
            error: [{
                entity: "user",
                msg: "user not found"
            }]
        })
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

/**
 * @swagger
 * /watermark/collection/{col_id}:
 *   get:
 *     summary: get all watermarks of a collection
 *     parameters: 
 *       - name: col_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/collection/:col_id', async (req, res) => {
    let col_id = `WCID-${req.params.col_id}`

    try {
        const col = await WatermarkCollection.get(col_id)

        if (col) {
            const watermarks = await col.watermaks

            return res.render('user/watermark/collection', {
                user: watermarks[0].watermark_col.gallery.user,
                artworks: watermarks
            })
        }
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

module.exports = router