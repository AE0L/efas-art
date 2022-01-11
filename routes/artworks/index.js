import express from 'express'
import Artwork from '../../models/artwork'

const router = express.Router()

router.get('/:artwork_id', async (req, res) => {
    const art = await Artwork.get(req.params.artwork_id)
    const user = art.art_col.gallery.user

    res.render('user_showcase-artwork', {
        user: {
            id: user.id,
            handle: `@${user.username}`
        },

        art: {
            id: art.id,
            name: art.name,
            desc: art.description,
            pic: art.document
        }
    })
})

export default router