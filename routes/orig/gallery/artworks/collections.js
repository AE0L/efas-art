import express from 'express'
import ArtCollection from '../../../models/art_collection'
import User from '../../../models/user'
const router = express.Router()

/**
 * @swagger
 * /artwork/collections/{user_id}:
 *   get:
 *     summary: get all user's artwork collections
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
            const art_cols = await gallery.art_collections

            res.render('user/artwork/collections', {
                user: user,
                collections: art_cols
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
 * /artwork/collection/{col_id}:
 *   get:
 *     summary: get all artworks of a collection
 *     parameters:
 *       - name: col_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/collection/:col_id', async (req, res) => {
    let col_id = `ACID-${req.params.col_id}`

    try {
        const col = await ArtCollection.get(col_id)

        if (col) {
            const arts = await col.artworks

            return res.render('user/artwork/collection', {
                user: arts[0].art_col.gallery.user,
                artworks: arts
            })
        }
    } catch (e) {
        console.error(e)
        res.status(404).end()
    }
})

module.exports = router