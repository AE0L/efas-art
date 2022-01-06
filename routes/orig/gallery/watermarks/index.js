import express from 'express'
const router = express.Router()

router.get('/watermark', require('./watermark'))
router.get('/watermark', require('./collections'))

module.exports = router