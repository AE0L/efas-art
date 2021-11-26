import express from 'express'
const router = express.Router()

router.use('/', require('./auth'))

router.get('/', (req, res) => {
    res.sendFile('index')
})

module.exports = router
