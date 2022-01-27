const express = require('express')
const artworks = require('./artworks')
const collections = require('./collections')
const others = require('./others')
const { load_user } = require('../middlewares')

const router = express.Router()

router.use('/:user_id', load_user, artworks)
router.use('/:user_id', load_user, collections)
router.use('/:user_id', load_user, others)

router.get('/:user_id/', (req, res) => {
    res.redirect(`/u/${req.params.user_id}/works`)
})

module.exports = router