import express from 'express'
const router = express.Router()

router.get('/list/:col_id', (req, res) => {
    res.send(req.params)
})

router.get('/item/:id', (req, res) => {
    res.send(req.params)
})

module.exports = router