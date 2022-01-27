const express = require('express')
const { User } = require('../../models/user')

const router = express.Router()

router.get('/about', async (req, res) => {
    try {
        const { user } = req.data
        const ses_user = await User.get(req.session.user_id)
        const followed = await ses_user.is_following(user)

        return res.render('user_about.ejs', {
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                handle: `@${user.username}`,
                bio: user.bio_text,
                pic: user.profile_pic,
                followed: followed
            }
        })
    } catch (err) {
        console.error(err)
        return res.redirect('/404')
    }
})

router.post('/follow', async (req, res) => {
    try {
        const { user } = req.data
        const ses_user = await User.get(req.session.user_id)

        await ses_user.follow(user)

        return res.send({ success: true, user: user.id, msg: 'follow successful' })
    } catch (e) {
        console.error(e)
        return res.send({ success: false, errors: [e] })
    }
})

router.post('/unfollow', async (req, res) => {
    try {
        const { user } = req.data
        const ses_user = await User.get(req.session.user_id)

        await ses_user.unfollow(user)

        return res.send({ success: true, user: user.id, msg: 'unfollow successful' })
    } catch (err) {
        console.error(err)
        return res.send({ success: false, errors: [e] })
    }
})


module.exports = router