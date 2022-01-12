import express from 'express'
import WatermarkCollection from '../../models/watermark_collection'
import { load_user_dashboard } from '../middlewares'

const router = express.Router()

router.get('/', load_user_dashboard, async (req, res) => {
    const { user, wat_collections } = req.data

    let wats = []

    wat_collections.forEach(async (wat_col) => {
        const watermarks = await wat_col.watermarks
        wats.push(...watermarks)
    })

    wats.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    const wat_cols = await wat_collections.map(async wat_col => {
        const _wats = await wat_col.watermarks

        return {
            id: wat_col.id,
            name: wat_col.name,
            pic: _wats[0].document
        }
    })

    res.render('dashboard_watermarks', {
        user: { id: user.id },

        wat_cols: wat_cols,

        wats: wats.map(wat => ({
            id: wat.id,
            name: wat.name,
            pic: wat.document
        }))
    })
})

router.get('/collections', load_user_dashboard, async (req, res) => {
    const { user, wat_collections } = req.data

    const wat_cols = await wat_collections.map(async wat_col => {
        const wats = await wat_col.watermarks

        return {
            id: wat_col.id,
            name: wat_col.name,
            pic: wats[0].document
        }
    })

    res.render('dashboard_cols-wtm', {
        user: { id: user.id },
        wat_cols: wat_cols
    })
})

router.get('/collection/:col_id', load_user_dashboard, async (req, res) => {
    const { user } = req.data
    const col = await WatermarkCollection.get(req.params.col_id)
    const wats = await col.watermaks

    if (col.gallery.user.id !== user.id) {
        return res.redirect('/404')
    }

    res.render('dashboard_col-wtm', {
        user: { id: user.id },
        col: {
            id: col.id,
            name: col.name,
            desc: col.description,
            wats: wats.map(wat => ({ name: wat.name, pic: wat.document }))
        }
    })
})

export default router