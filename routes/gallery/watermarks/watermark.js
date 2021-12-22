import express from 'express'
import Watermark from '../../../models/watermark'
const router = express.Router()

/**
 * @swagger
 * /watermark/{watermark_id}:
 *   get:
 *     summary: get specific watermark
 *     parameters:
 *       - name: watermark_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:watermark_id', async (req, res) => {
    let watermark_id = `WID-${req.params.watermark_id}`

    try {
        const watermark = await Watermark.get(watermark_id)

        if (watermark) {
            const col = watermark.watermark_col
            const gallery = watermark_col.gallery
            const user = gallery.user

            res.render('user/watermark/item', {
                user: user,
                collection: col,
                watermark: watermark
            })
        }
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

module.exports = router