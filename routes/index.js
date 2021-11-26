import express from 'express'
const router = express.Router()

router.use('/', require('./auth'))

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/timeline', (req, res) => {
    res.render('timeline')
})

module.exports = router
