/** Default router for user authentication (Login & Signup)
 * 
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

/**
 * @swagger
 * /login:
 *  post:
 *      summary: login user credentials
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              description: username input
 *                          password:
 *                              type: string
 *                              description: password input
 *      responses:
 *          200:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              succcess:
 *                                  type: boolean
 */
router.post('/login', [
    check('username').isLength({ min: 4 }).trim().escape(),
    check('password').isLength({ min: 8, max: 20 }).trim()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.send({ errors: errors })
    }

    try {
        let { username, password } = req.body
        const user = await User.get_user(username)

        if (user) {
            if (await user.verify_pass(password)) {
                if (!req.session.user_id) {
                    req.session.user_id = user.id
                }
                res.send({ success: true })
            } else {
                res.send({
                    success: false,
                    param: 'password',
                    reason: 'Incorrect password'
                })
            }
        } else {
            res.send({
                success: false,
                param: 'username',
                reason: 'User not found'
            })
        }
    } catch (e) {
        console.error(e)
        res.end()
    }
})


/**
 * @swagger
 * /register:
 *  post:
 *      summary: register user's credentials
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          username:
 *                              type: string
 *                          password:
 *                              type: string
 *                          first_name:
 *                              type: string
 *                          last_name:
 *                              type: string
 *      responses:
 *          200:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 */
router.post('/register', [
    check('email')
        .isEmail()
            .withMessage('Invalid email')
        .normalizeEmail(),
    check('username')
        .isLength({ min: 4 })
            .withMessage('Invalid length')
        .trim().escape(),
    check('password')
        .isLength({ min: 8, max: 20 })
            .withMessage('Invalid length')
        .trim(),
    check('first_name').trim().escape(),
    check('last_name').trim().escape()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.send({ errors: errors })
    }

    let { email, first_name, last_name, username, password } = req.body

    try {
        const user = new User(first_name, last_name, username, password)
        const gallery = new Gallery(user)
        const contact = new Contact(user, email)

        await user.hash_pass()
        await user.save()
        await gallery.save()
        await contact.save()

        res.send({ success: true })
    } catch (e) {
        console.error(e)
        res.send({ success: false })
    } finally {
        res.end()
    }
})

/**
 * @swagger
 * /logout:
 *  post:
 *      summary: logout user and destroy session
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err)
    })

    res.redirect('/')
})

module.exports = router