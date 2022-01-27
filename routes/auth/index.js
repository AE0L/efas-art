/** Default router for user authentication (Login & Signup)
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const express = require('express')
const { check, validationResult } = require('express-validator')
const Contact = require('../../models/contacts')
const Gallery = require('../../models/gallery')
const { User } = require('../../models/user')
const { inspect } = require('util')

const router = express.Router()

/**
 * @swagger
 * /login:
 *   post:
 *     summary: login user credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: username input
 *               password:
 *                 type: string
 *                 description: password input
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succcess:
 *                   type: boolean
 */
router.post('/login', [
    check('username')
        .isLength({ min: 4 })
            .withMessage('username invalid length')
        .trim().escape(),

    check('password')
        .isLength({ min: 8, max: 20 })
            .withMessage('password invalid length')
        .trim(),

], async (req, res) => {
    const validation = validationResult(req)

    if (!validation.isEmpty()) {
        return res.send({
            success: false,
            errors: validation.errors
        })
    }

    try {
        let { username, password } = req.body
        const user = await User.get_user(username)

        if (user) {
            if (await user.verify_pass(password)) {
                if (!req.session.user_id) {
                    req.session.user_id = user.id
                }

                return res.send({
                    success: true,
                    msg: 'login successful'
                })
            } else {
                return res.send({
                    value: password,
                    success: false,
                    param: 'password',
                    msg: 'incorrect password'
                })
            }
        } else {
            return res.send({
                value: username,
                success: false,
                param: 'username',
                msg: 'username not registered'
            })
        }
    } catch (e) {
        console.trace(e)
        res.end()
    }
})


/**
 * @swagger
 * /register:
 *   post:
 *     summary: register user's credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.post('/register', [
    check('email')
        .isEmail()
            .withMessage('invalid email')
        .normalizeEmail(),

    check('username')
        .isLength({ min: 4 })
            .withMessage('username invalid length')
        .trim().escape(),

    check('password')
        .isLength({ min: 8, max: 20 })
            .withMessage('password invalid length')
        .trim(),

    check('first_name').trim().escape(),

    check('last_name').trim().escape()
], async (req, res) => {
    const validation = validationResult(req)

    if (!validation.isEmpty()) {
        return res.send({
            success: false,
            errors: validation.errors
        })
    }

    let { email, first_name, last_name, username, password } = req.body

    try {
        const tmp_user = await User.get_user(username)

        const errors = {
            success: false,
            errors: []
        }

        if (tmp_user) {
            errors.errors.push({
                value: username,
                param: 'username',
                msg: 'username already exists'
            })
        }

        const email_exists = await Contact.email_exists(email)

        if (email_exists) {
            errors.errors.push({
                value: email,
                param: 'email',
                msg: 'email is already registered'
            })
        }

        if (errors.errors.length > 0) {
            return res.send(errors)
        }

        const user = new User(first_name, last_name, username, password)
        const gallery = new Gallery(user)
        const contact = new Contact(user, email)


        await user.gen_root_dir()
        await gallery.gen_art_col_dir()
        await gallery.gen_watermark_col_dir()

        await user.hash_pass()
        await user.save()
        await gallery.save()
        await contact.save()

        return res.send({
            success: true,
            msg: 'account creation was successful'
        })
    } catch (e) {
        console.trace(inspect(e))
        return res.send({ success: false, errors: [e] })
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