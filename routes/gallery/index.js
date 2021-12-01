import express from 'express'
import User from '../../models/user'
const router = express.Router()

router.use('/', require('./artworks'))
router.use('/', require('./watermarks'))

/**
 * @swagger
 * /gallery/{username}:
 *   get:
 *     summary: get user's gallery
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: owner of the gallery
 *         schema:
 *           type: string
 */
router.get('/gallery/:username', async (req, res) => {
    const { username } = req.params

    try {
        const user = await User.get_user(username)
        const gallery = await user.gallery
        const art_cols = await gallery.art_collections

        const data = {
            art_collections: art_cols,
            recent_artworks: []
        }

        let count = 0

        for (let col of art_cols) {
            for (let art of col.artworks) {
                data.recent_artworks.push(art)
                count += 1

                if (count > 20) break
            }
            if (count > 20) break
        }

        return res.render('/user/gallery', data)
    } catch (e) {
        console.error(e)
        return res.status(404).end()
    }
})

module.exports = router