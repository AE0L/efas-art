const express = require('express')
const Reaction = require('../../models/reaction')
const moment = require('moment')
const { load_artwork } = require('../middlewares')
const { User } = require('../../models/user')
const { inspect } = require('util')

const router = express.Router()

router.get('/:artwork_id', load_artwork, async (req, res) => {
    const { user } = req.data

    if (user.id === req.session.user_id) {
        return res.redirect('/profile')
    } else {
        try {
            const { art, gallery } = req.data
            const liked = await art.is_liked(user)
            const cols = await gallery.art_collections
            const ses_user = await User.get(req.session.user_id)

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
                const pic = com.user.profile_pic === '' ? process.env.PFP_PLACEHOLDER : com.user.profile_pic

                return {
                    text: com.comment_text,
                    date: com.comment_date,
                    user: {
                        name: user.username,
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
            console.error(err)
            res.redirect('/404')
        }
    }
})

router.get('/:artwork_id/like', load_artwork, async (req, res) => {
    try {
        const { art } = req.data
        const ses_user = await User.get(req.session.user_id)

        await ses_user.like(art)

        return res.redirect(`/artworks/${art.id}`)
    } catch (err) {
        console.error(err)
        return res.redirect('/404')
    }
})

router.get('/:artwork_id/unlike', load_artwork, async (req, res) => {
    try {
        const { art } = req.data
        const ses_user = await User.get(req.session.user_id)

        await ses_user.unlike(art)

        return res.redirect(`/artworks/${art.id}`)
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.post('/:artwork_id/comment', load_artwork, async (req, res) => {
    try {
        const ses_user = await User.get(req.session.user_id)
        const { art } = req.data
        const { comment_text } = req.body

        await art.add_comment(ses_user, comment_text)

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false })
    }
})

module.exports = router