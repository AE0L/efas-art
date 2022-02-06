const express = require('express')
const { User } = require('../../models/user')
const { create_user_notif } = require('../middlewares')

const router = express.Router()

router.get('/about', async (req, res) => {
    try {
        const { user, ses_user } = req.data

        return res.render('user_about.ejs', {
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                handle: `@${user.username}`,
                bio: user.bio_text,
                pic: user.profile_pic ? user.profile_pic : process.env.PFP_PLACEHOLDER,
                followed: await ses_user.is_following(user)
            }
        })
    } catch (err) {
        console.error(err)
        return res.redirect('/404')
    }
})

router.get('/follow', create_user_notif('follow'), async (req, res) => {
    try {
        const { user, ses_user, notif } = req.data
        const { art } = req.query

        await ses_user.follow(user)
        await notif.save()

        if (req.query.art) {
            return res.redirect(`/artworks/${art}`)
        } else {
            return res.redirect(`/u/${user.id}/${req.query.page}`)
        }
    } catch (e) {
        console.error(e)
        return res.redirect('/404')
    }
})

router.get('/unfollow', async (req, res) => {
    try {
        const { user, ses_user, notif } = req.data
        const { art } = req.query

        await ses_user.unfollow(user)
        await notif.save()

        if (req.query.art) {
            return res.redirect(`/artworks/${art}`)
        } else {
            return res.redirect(`/u/${user.id}/${req.query.page}`)
        }
    } catch (err) {
        console.error(err)
        return res.redirect('/404')
    }
})


module.exports = router