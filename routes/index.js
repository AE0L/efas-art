const express = require("express")
const dashboard = require('./dashboard/index')
const user = require('./user/index')
const artworks = require('./artworks/index')
const auth = require('./auth/index')
const { authenticate } = require('./middlewares/index')

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/home')
    } else {
        res.render('index')
    }
})

router.get('/home', authenticate, (req, res) => {
    res.render('user_works')
})

router.use('/', auth)
router.use('/u', authenticate, user)
router.use('/artworks', authenticate, artworks)
router.use('/profile', authenticate, dashboard)

module.exports = router