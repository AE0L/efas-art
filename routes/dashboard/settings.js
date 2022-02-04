const express = require('express')
const { load_user_dashboard } = require('../middlewares')
const { check, validationResult } = require('express-validator')

const router = express.Router()

router.get('/', (req, res) => {
    const setting = req.query['s']

    if (setting) {
        switch (setting) {
            case 'prof':
                const { src: user } = req.data.user
                return res.render('dashboard_settings-profile', {
                    data: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        bio: user.bio_text
                    }
                })
            case 'sec':
                return res.render('dashboard_settings-security')
            case 'notif':
                return res.render('dashboard_settings-notification')
        }
    } else {
        const { src: user } = req.data.user
        return res.render('dashboard_settings-profile', {
            data: {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                bio: user.bio_text

            }
        })
    }
})

router.post('/edit/profile', async (req, res) => {
    const { first_name, last_name, bio } = req.body
    const user = req.data.user.src

    try {
        const changes = []

        if (first_name !== user.first_name) {
            user.first_name = first_name
            changes.push('first_name')
        }

        if (last_name !== user.last_name) {
            user.last_name = last_name
            changes.push('last_name')
        }

        if (bio !== user.bio) {
            user.bio_text = bio
            changes.push('bio')
        }

        if (changes.length > 0) {
            await user.update()

            return res.send({
                success: true,
                changes: changes,
                msg: 'profile update successful'
            })
        } else {
            return res.send({
                success: false,
                msg: 'nothing to change'
            })
        }
    } catch (e) {
        console.trace(e)
        res.send({ success: false })
    }
})

router.post('/edit/security', [
    check('cur_pass')
        .isLength({ min: 8, max: 20 })
            .withMessage('current password invalid length')
        .trim(),

    check('new_pass')
        .isLength({ min: 8, max: 20 })
            .withMessage('current password invalid length')
        .trim()
], async (req, res) => {
    const validation = validationResult(req)

    if (!validation.isEmpty()) {
        return res.send({
            success: false,
            errors: validation.errors
        })
    }

    try {
        const { cur_pass, new_pass } = req.body
        const user = req.data.user.src
        const pass_is_correct = await user.verify_pass(cur_pass)

        if (cur_pass === new_pass) {
            return res.send({
                success: false,
                errors: [{
                    param: 'new_pass',
                    msg: 'new password is the same as current password'
                }]
            })
        }

        if (pass_is_correct) {
            await user.update_pass(new_pass)

            return res.send({
                success: true,
                msg: 'password update successful'
            })
        } else {
            return res.send({
                success: false,
                errors: [{
                    param: 'cur_pass',
                    msg: 'incorrect password'
                }]
            })
        }
    } catch (e) {
        console.trace(e)
        res.send({ success: false })
    }
})


module.exports = router