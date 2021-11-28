/** Default router for user authentication (Login & Signup)
 * 
 * @module routes/auth
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import express from 'express'
import { check, validationResult } from 'express-validator'
import Contact from '../../models/contacts'
import Gallery from '../../models/gallery'
import User from '../../models/user'

const router = express.Router()

/** POST /login
 * @summary user login authentication
 * @returns {object} - { success: <boolean> }
 */
router.post('/login', [
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.send({ errors: errors })
    }

    let { username, password } = req.body

    try {
        const user = await User.get(username)

        if (user) {
            if (await user.verify_pass(password)) {
                req.session.user_id = user.id
                res.send({ success: true })
            }
        }
    } catch (e) {
        console.error(e)
    }

    res.send({ sucess: false })
})


/** POST /register
 * @summary create user account
 * @returns {object} - { sucess: <boolean> }
 */
router.post('/register', [
    check('email').isEmail().trim().escape().normalizeEmail(),
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim(),
    check('first_name').trim().escape(),
    check('last_name').trim().escape()
], async (req, res) => {
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