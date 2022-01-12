import express from 'express'
import WatermarkCollection from '../../models/watermark_collection'
import moment from 'moment'
import { load_user_dashboard } from '../middlewares'

const router = express.Router()

router.get('/', load_user_dashboard, async (req, res) => {
    const { user, wat_collections } = req.data
    const wats = []

    wat_collections.forEach(async (col) => {
        const watermarks = await col.watermarks
        wats.push(...watermarks)
    })

    wats.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    const wat_cols = await wat_collections.map(async (col) => {
        const _wats = await col.watermarks
        const pic = _wats.length <= 0 ? process.env.COL_PLACEHOLDER : _wats[0].document

        return {
            id: col.id,
            title: col.name,
            pic: pic
        }
    })

    res.render('dashboard_watermarks', {
        user: { id: user.id },

        wat_cols: await Promise.all(wat_cols),

        wats: wats.map(w => ({
            id: w.id,
            title: w.name,
            pic: w.document
        }))
    })
})

router.get('/collections', load_user_dashboard, async (req, res) => {
    const { user, wat_collections } = req.data

    const wat_cols = await wat_collections.map(async wat_col => {
        const wats = await wat_col.watermarks
        const pic = wats.length <= 0 ? process.env.COL_PLACEHOLDER : wats[0].document

        return {
            id: wat_col.id,
            title: wat_col.name,
            pic: pic
        }
    })

    res.render('dashboard_cols-wtm', {
        user: { id: user.id },
        wat_cols: await Promise.all(wat_cols)
    })
})

router.get('/collection/create', load_user_dashboard, async (req, res) => {
    res.render('dashboard_create-wtm-col')
})

router.post('/collection/create', load_user_dashboard, async(req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const { gallery } = req.data
        const wat_col = new WatermarkCollection(gallery, col_name, col_desc, moment())

        await wat_col.gen_col_dir()
        await wat_col.save()

        res.redirect('/profile/watermarks/')
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.get('/collection/:col_id', load_user_dashboard, async (req, res) => {
    try {
        const { user } = req.data
        const col = await WatermarkCollection.get(req.params.col_id)
        const wats = await col.watermarks

        if (col.gallery.user.id !== user.id) {
            return res.redirect('/404')
        }

        res.render('dashboard_col-wtm', {
            user: { id: user.id },
            col: {
                id: col.id,
                name: col.name,
                desc: col.description,
                date: col.creation_date,
                wats: wats.map(wat => ({ name: wat.name, pic: wat.document }))
            }
        })
    } catch(err) {
        console.error(err)
        res.redirect('/404')
    }
})

export default router