import express from 'express'
const router = express.Router()

router.use('/', require('./auth'))

router.get('/', (req, res) => {
    res.sendFile('index')
})

router.get('/timeline', (req, res) => {
    res.sendFile('timeline')
})

module.exports = router
