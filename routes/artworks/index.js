const express = require('express')
const Reaction = require('../../models/reaction')
const moment = require('moment')
const { load_artwork, create_art_notif } = require('../middlewares')
const { User } = require('../../models/user')
const { inspect } = require('util')
const Notification = require('../../models/notification')

const router = express.Router()

router.get('/:artwork_id', load_artwork, async (req, res) => {
    const { user } = req.data

    if (user.id === req.session.user_id) {
        return res.redirect(`/profile/artworks/edit?art_id=${req.data.art.id}`)
    } else {
        try {
            const { art, gallery, ses_user } = req.data
            const cols = await gallery.art_collections
            const liked = await art.is_liked(ses_user)

            let arts = []

            for (let col of cols) {
                const _artworks = await col.artworks
                arts.push(..._artworks)
            }

            arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

            const date_now = moment()
            const date_week_before = moment().subtract(21, 'days')

            let rec_arts = arts.filter(_art => {
                let art_mom = moment(_art.creation_date)
                return art_mom.isBetween(date_week_before, date_now)
            })

            rec_arts = rec_arts.map(a => ({
                id: a.id,
                title: a.name,
                pic: a.document
            }))

            let coms = await art.comments
            coms = Promise.all(coms.map(com => {
                const pic = com.user.profile_pic ? com.user.profile_pic : process.env.PFP_PLACEHOLDER

                return {
                    text: com.comment_text,
                    date: com.comment_date,
                    user: {
                        name: com.user.username,
                        pic: pic
                    }
                }
            }))

            const data = {
                user: {
                    id: user.id,
                    handle: `@${user.username}`,
                    rec_arts: rec_arts,
                    pfp: process.env.PFP_PLACEHOLDER,
                    follow: await ses_user.is_following(user)
                },

                art: {
                    id: art.id,
                    title: art.name,
                    desc: art.description.split('\n'),
                    liked: liked,
                    pic: art.document,
                    tags: art.tags.split(','),
                    comments: await coms
                }
            }

            if (req.query.test) {
                return res.send(data)
            }

            return res.render('user_showcase-artwork', data)
        } catch (err) {
            console.trace(err)
            res.redirect('/404')
        }
    }
})


router.get('/:artwork_id/like', load_artwork, create_art_notif('like'), async (req, res) => {
    try {
        const { art, ses_user, notif } = req.data

        await ses_user.like(art)
        await notif.save()

        return res.redirect(`/artworks/${art.id}`)
    } catch (err) {
        console.trace(err)
        return res.redirect('/404')
    }
})


router.get('/:artwork_id/unlike', load_artwork, async (req, res) => {
    try {
        const { art, ses_user } = req.data

        await ses_user.unlike(art)

        return res.redirect(`/artworks/${art.id}`)
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.post('/:artwork_id/comment', load_artwork, create_art_notif('comment'), async (req, res) => {
    try {
        const { art, ses_user, notif } = req.data
        const { comment_text } = req.body

        await art.add_comment(ses_user, comment_text)
        await notif.save()

        return res.redirect(`/artworks/${art.id}`)
    } catch (e) {
        console.trace(e)
        return res.send({ success: false })
    }
})

module.exports = router