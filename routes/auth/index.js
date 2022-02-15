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


router.post('/register', [
    check('email')
        .isEmail()
            .withMessage('invalid email'),

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
        console.trace(e)
        return res.send({ success: false, errors: [e] })
    } finally {
        res.end()
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.trace(err)
    })

    res.redirect('/')
})

const send_email = require('gmail-send')({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    subject: 'Forgot password verification'
})
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const forgot_email_template = fs.readFileSync(path.join(__dirname, '/email_forgot-pass.ejs'), 'ascii')

router.post('/forgot-password', async (req, res) => {
    try {
        const { forgot_email } = req.body
        const user = await User.get_email(forgot_email)

        if (user) {
            const forgot_email_html = ejs.render(forgot_email_template, {
                user: {
                    id: user.id
                }
            })

            const { result, full } = await send_email({
                html: forgot_email_html,
                to: forgot_email
            })

            if (result.split(' ')[2] === 'OK' && full.accepted[0] === forgot_email) {
                return res.send({ success: true })
            }

            return res.send({ success: false })
        }

        return res.send({ success: false, msg: `user with said email doesn't exist` })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false, error: e })
    }
})

router.get('/verify-forgot-password', async (req, res) => {
    return res.render('index', { verify_pass: true, uid: req.query.uid })
})

router.post('/verify-new-password', async (req, res) => {
    try {
        const user = await User.get(req.query.uid)

        await user.update_pass(req.body.password)

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false, error: e })
    }
})

module.exports = router