const express = require('express')
const router = express.Router()

router.use('/', require('./auth'))

router.get('/', (req, res) => {
    res.render('index', {
        msg: 'Hello, World!'
    })
})

export default router
