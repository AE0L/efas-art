const express = require('express')
const artworks = require('./artworks')
const collections = require('./collections')
const others = require('./others')
const { load_user } = require('../middlewares')
const { User } = require('../../models/user')
const Artwork = require('../../models/artwork')

const router = express.Router()

router.use('/:user_id', load_user, artworks)
router.use('/:user_id', load_user, collections)
router.use('/:user_id', load_user, others)

router.get('/:user_id/', (req, res) => {
    res.redirect(`/u/${req.params.user_id}/works`)
})

router.post('/search', async (req, res) => {
    try {
        const query = req.body.query
        const users = await User.find_all(`${query}%`)
        const arts = await Artworks.find_all(`${query}%`)

        res.render('search-result', {
            success: true,
            arts: arts.map(art => ({
                id: art.id,

            })),
            users: users.map(user => ({
                id: user.id,
                handle: user.username,
                name: `${user.first_name} ${user.last_name}`
            }))
        })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false, msg: e })
    }
})

module.exports = router