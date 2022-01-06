import express from 'express'
const router = express.Router()

router.use('/artwork', require('./artwork'))
router.use('/artwork', require('./collections'))

module.exports = router