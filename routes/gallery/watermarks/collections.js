import express from 'express'
const router = express.Router()

router.get('/collections/:gallery_id', (req, res) => {
    res.send(req.params)
})

router.get('/collection/:id', (req, res) => {
    res.send(req.params)
})

module.exports = router