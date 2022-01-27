const express = require('express')
const Reaction = require('../../models/reaction')
const { load_artwork } = require('../middlewares')

const router = express.Router()

router.get('/:artwork_id', load_artwork, async (req, res) => {
    try {
        const { user, art } = req.data
        const liked = await art.is_liked(user)

        res.render('user_showcase-artwork', {
            user: {
                id: user.id,
                handle: `@${user.username}`
            },

            art: {
                id: art.id,
                title: art.name,
                desc: art.description,
                liked: liked,
                pic: art.document
            }
        })
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.get('/:artwork_id/like', load_artwork, async (req, res) => {
    try {
        const { user, art } = req.data
        const reaction = new Reaction(user, art, true)

        await reaction.save()

        return res.send({ success: true })
    } catch (err) {
        console.error(err)
        return res.send({ success: false })
    }
})

module.exports = router