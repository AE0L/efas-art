import express from 'express'
const router = express.Router()

router.use('/gallery', require('./artworks'))
router.use('/gallery', require('./watermarks'))

module.exports = router