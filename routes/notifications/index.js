const router = require('express').Router()
const Artwork = require('../../models/artwork')
const Notification = require('../../models/notification')
const { User } = require('../../models/user')

router.get('/notifications', async (req, res) => {
    try {
        const ses_user = await User.get(req.session.user_id)
        const unread_notifs = await ses_user.get_unread_notifications()
        const notifs = []

        for (let notif of unread_notifs) {
            let msg = ''

            switch (notif.type) {
                case 'like':
                    const like_art = await Artwork.get(notif.detail)
                    msg = `${notif.sender.username} liked your artwork, ${like_art.name}`
                    break;

                case 'follow':
                    msg = `${notif.sender.username} followed you`
                    break;

                case 'comment':
                    const com_art = await Artwork.get(notif.detail)
                    msg = `${notif.sender.username} commented on your artwork, ${com_art.name}`
            }

            notifs.push({
                id: notif.id,
                user_pic: process.env.PFP_PLACEHOLDER,
                msg: msg,
                date: notif.creation_date
            })
        }

        return res.send({
            success: true,
            notifs: notifs
        })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false })
    }
})

router.get('/notification/:notif_id', async (req, res) => {
    try {
        const notif = await Notification.get(req.params.notif_id)

        if (notif.type === 'like' || notif.type === 'comment') {
            return res.redirect(`/artworks/${notif.detail}`)
        } else if (notif.type === 'follow') {
            return res.redirect(`/u/${notif.sender.id}`)
        }
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.post('/notifications/read', async (req, res) => {
    try {
        const { notif_ids } = req.body
        const notifs = []

        for (let notif_id of notif_ids) {
            notifs.push(await Notification.get(notif_id))
        }

        for (let notif of notifs) {
            await notif.set_as_viewed()
        }

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false, error: e })
    }
})

module.exports = router