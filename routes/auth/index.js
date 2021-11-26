import express from 'express'
import { check, validationResult } from 'express-validator'
import public_helper from '../public_helper'

const router = express.Router()

router.post('/login', (req, res) => {
    // TODO authenticate user
    res.end()
})

const register_checks = [
    check('email').isEmail().trim().escape().normalizeEmail(),
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim(),
    check('first_name').trim().escape(),
    check('last_name').trim().escape()
]

router.post('/register', register_checks, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log('test')
        // TODO validation errors found
    }

    res.send({ succcess: true })
})

router.get('/timeline', (req, res) => {
    res.sendFile(public_helper('timeline.html'))
})

module.exports = router