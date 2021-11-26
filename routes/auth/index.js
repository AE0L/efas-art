import express from 'express'
import {
    check,
    validationResult
} from 'express-validator'
import Contact from '../../models/contacts'
import Gallery from '../../models/gallery'
import User from '../../models/user'

const router = express.Router()

// LOGIN
const login_checks = [
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim()
]

router.post('/login', login_checks, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.send({ errors: errors })
    }

    let { username, password } = req.body

    try {
        const user = User.login_instance(username, password)

        if (await user.is_exist()) {
            if (await user.verify_pass()) {
                // TODO login info verified, redirect
            }
        }
    } catch(e) {
        console.error(e)
    }

    res.end()
})

// REGISTER
const register_checks = [
    check('email').isEmail().trim().escape().normalizeEmail(),
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim(),
    check('first_name').trim().escape(),
    check('last_name').trim().escape()
]

router.post('/register', register_checks, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.send({ errors: errors })
    }

    let { email, first_name, last_name, username, password } = req.body

    try {
        const user = new User(email, first_name, last_name, username, password)
        const gallery = new Gallery(user)
        const contact = new Contact(user, email)

        await user.hash_pass()
        await user.save()
        await gallery.save()
        await contact.save()
    } catch (e) {
        console.error(e)
    }

    res.send({ succcess: true })
})

module.exports = router