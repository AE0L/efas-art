const express = require("express")
const dashboard = require('./dashboard/index')
const user = require('./user/index')
const artworks = require('./artworks/index')
const auth = require('./auth/index')
const { authenticate } = require('./middlewares/index')

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/home')
    } else {
        res.render('index')
    }
})

router.get('/home', authenticate, (req, res) => {
    res.redirect('/profile')
})

router.use('/', auth)
router.use('/u', authenticate, user)
router.use('/artworks', authenticate, artworks)
router.use('/profile', authenticate, dashboard)

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

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

module.exports = router