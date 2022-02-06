const express = require("express")
const dashboard = require('./dashboard/index')
const user = require('./user/index')
const artworks = require('./artworks/index')
const auth = require('./auth/index')
const { authenticate } = require('./middlewares/index')
const notifications = require('./notifications')

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { User } = require("../models/user")
const Artwork = require('../models/artwork')

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/home')
    } else {
        res.render('index', { verify_pass: false })
    }
})

router.get('/home', authenticate, async (req, res) => {
    try {
        const ses_user = await User.get(req.session.user_id)
        const follows = await ses_user.get_follows()

        const all_rec_arts = []

        for (let follow of follows) {
            const _user = follow.followed
            const gal = await _user.gallery
            const art_cols = await gal.art_collections

            let arts = []

            for (let art_col of art_cols) {
                const _arts = await art_col.artworks
                arts.push(..._arts)
            }

            arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

            const date_now = moment()
            const date_week_before = moment().subtract(6, 'days')

            let rec_arts = arts.filter(art => {
                let art_mom = moment(new Date(art.creation_date))
                return art_mom.isBetween(date_week_before, date_now, undefined, '[]')
            })

            rec_arts = await Promise.all(rec_arts.map(async (rec_art) => {
                return {
                    user: _user.username,
                    id: rec_art.id,
                    title: rec_art.name,
                    pic: rec_art.document
                }
            }))

            all_rec_arts.push(...rec_arts)
        }

        const data = {
            user: ses_user,
            works: all_rec_arts
        }

        if (req.query.test) {
            return res.send(data)
        }

        return res.render('home', data)
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

router.use('/', auth)
router.use('/', authenticate, notifications)
router.use('/u', authenticate, user)
router.use('/artworks', authenticate, artworks)
router.use('/profile', authenticate, dashboard)


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

router.use('/download/image', async (req, res) => {
    const gd = google.drive({ version: 'v3', auth: global.gauth })
    const { id, location, type } = req.query
    const dest = fs.createWriteStream(path.resolve(__dirname, `../uploads/${location}`, `${moment().toDate().getTime()}-${getRandomInt(1000, 9999)}-${id}.${type}`))

    gd.files.get({
        fileId: id,
        alt: 'media'
    }, {
        responseType: 'stream'
    }, (_, _res) => {
        _res.data
            .on('end', async () => {
                res.sendFile(dest.path, (err) => {
                    if (err) {
                        console.trace(err)
                    } else {
                        try {
                            fs.promises.unlink(dest.path)
                        } catch (e) {
                            console.trace(e)
                        }
                    }
                })
            })
            .on('error', (error) => {
                console.trace(error)
            })
            .pipe(dest)
    })
})

router.post('/search', async (req, res) => {
    try {
        const query = req.body.query
        const users = await User.find_all(`${query}%`)
        const arts = await Artwork.find_all(`${query}%`)

        res.render('search-result', {
            arts: arts.map(art => ({
                id: art.id,
                title: art.name,
                pic: art.document,
                user: art.art_col.gallery.user.username
            })),
            users: users.map(u => ({
                id: u.id,
                handle: u.username,
                name: `${u.first_name} ${u.last_name}`,
                pic: u.profile_pic ? u.profile_pic : process.env.PFP_PLACEHOLDER,
            }))
        })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false, msg: e })
    }
})

module.exports = router