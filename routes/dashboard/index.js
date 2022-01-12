import express from 'express'
import moment from 'moment'
import artworks from './artworks'
import watermarks from './watermarks'
import settings from './settings'
import { load_user_dashboard } from '../middlewares'

const router = express.Router()

router.get('/', load_user_dashboard, async (req, res) => {
    const { user, art_collections, wat_collections } = req.data

    let arts = []

    art_collections.forEach(async (art_col) => {
        const _artworks = await art_col.artworks
        arts.push(..._artworks)
    })

    arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    let wats = []

    wat_collections.forEach(async (wat_col) => {
        const _watermarks = await wat_col.watermarks
        wats.push(..._watermarks)
    })

    wats.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    const date_now = moment()
    const date_week_before = moment().subtract(7, 'days')

    let rec_arts = arts.filter(art => {
        let art_mom = moment(art.creation_date)
        return art_mom.isBetween(date_week_before, date_now)
    })

    rec_arts = rec_arts.map(a => ({
        id: a.id,
        title: a.name,
        pic: a.document
    }))

    let rec_wats = wats.filter(wat => {
        let wat_mom = moment(wat.creation_date)
        return wat_mom.isBetween(date_week_before, date_now)
    })

    rec_wats = rec_wats.map(a => ({
        id: a.id,
        title: a.name,
        pic: a.document
    }))


    let rec_art_cols = art_collections.filter(art_col => {
        let art_col_mom = moment(art_col.creation_date)
        return art_col_mom.isBetween(date_week_before, date_now)
    })

    rec_art_cols = rec_art_cols.map(async (ac) => {
        const _arts = await ac.artworks

        return {
            id: ac.id,
            title: ac.name,
            pic: _arts[0].document
        }
    })

    return res.render('dashboard_home.ejs', {
        user: { id: user.id },
        rec_arts: rec_arts,
        rec_wats: rec_wats,
        rec_art_cols: rec_art_cols,
    })
})

router.use('/artworks', artworks)
router.use('/watermarks', watermarks)
router.use('/settings', settings)

export default router