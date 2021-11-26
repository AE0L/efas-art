import express from 'express'
import { check, validationResult } from 'express-validator'
import Contact from '../../models/contacts'
import Gallery from '../../models/gallery'
import User from '../../models/user'

const router = express.Router()

router.post('/login', (req, res) => {
    // TODO authenticate user
    res.end()
})

const register_checks = [
    check('email').isEmail().trim().escape().normalizeEmail(),
    check('username').isLength({
        min: 4
    }).trim().escape(),
    check('password').isLength({
        min: 8,
        max: 20
    }).trim(),
    check('first_name').trim().escape(),
    check('last_name').trim().escape()
]

router.post('/register', register_checks, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.error(errors)
        // TODO validation errors found
    }

    let {
        email,
        first_name,
        last_name,
        username,
        password
    } = req.body

    try {
        const user = new User(email, first_name, last_name, username, password)
        const gallery = new Gallery(user)
        const contact = new Contact(user, email)

        await user.save()
        await gallery.save()
        await contact.save()
    } catch (e) {
        console.error(e)
    }

    res.send({
        succcess: true
    })
})


module.exports = router