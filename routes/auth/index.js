const express = require('express')
const router = express.Router()

router.get('/login', (req, res) => {
    // TODO serve login page
    res.end()
})

router.post('/login', (req, res) => {
    // TODO authenticate user
    res.end()
})

router.get('/register', (req, res) => {
    // TODO serve register page
    res.end()
})

router.post('/register', (req, res) => {
    // TODO save user's information
    res.end()
})

export default router
