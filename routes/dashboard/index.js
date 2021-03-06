const express = require('express')
const moment = require('moment')
const artworks = require('./artworks')
const watermarks = require('./watermarks')
const settings = require('./settings')
const bookmarks = require('./bookmarks')
const { load_user_dashboard } = require('../middlewares')

const router = express.Router()

router.get('/', load_user_dashboard, async (req, res) => {
    const { user, art_collections, wat_collections } = req.data

    let arts = []

    for (let art_col of art_collections) {
        const _artworks = await art_col.artworks
        arts.push(..._artworks)
    }

    arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    const date_now = moment()
    const date_week_before = moment().subtract(21, 'days')

    let rec_arts = arts.filter(art => {
        let art_mom = moment(art.creation_date)
        return art_mom.isBetween(date_week_before, date_now)
    })

    rec_arts = rec_arts.map(a => ({
        id: a.id,
        title: a.name,
        pic: a.document
    }))

    let rec_art_cols = art_collections.filter(art_col => {
        let art_col_mom = moment(new Date(art_col.creation_date))
        return art_col_mom.isBetween(date_week_before, date_now, undefined, '[]')
    })

    rec_art_cols = rec_art_cols.map(async (ac) => {
        const _arts = await ac.artworks
        const pic = _arts.length <= 0 ? process.env.COL_PLACEHOLDER : _arts[0].document

        return {
            id: ac.id,
            title: ac.name,
            pic: pic
        }
    })

    return res.render('dashboard_home.ejs', {
        user: { id: user.id },
        rec_arts: rec_arts,
        rec_art_cols: await Promise.all(rec_art_cols),
    })
})

router.use('/bookmarks', load_user_dashboard, bookmarks)
router.use('/artworks', load_user_dashboard, artworks)
router.use('/watermarks', load_user_dashboard, watermarks)
router.use('/settings', load_user_dashboard, settings)

module.exports = router