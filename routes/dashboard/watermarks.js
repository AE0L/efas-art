const router = require('express').Router()
const moment = require('moment')
const multer = require('multer')
const slugify = require('slugify')
const path = require('path')
const fs = require('fs')
const WatermarkCollection = require('../../models/watermark_collection')
const { load_user_dashboard } = require('../middlewares')
const Watermark = require('../../models/watermark')
const upload_watermark = multer({
    storage: multer.diskStorage({
        destination: (_req, _res, cb) => {
            cb(null, 'uploads/watermarks')
        },

        filename: (req, file, callback) => {
            const name = slugify(file.originalname, { lower: true })
            callback(null, `${moment().toDate().getTime()}-${req.data.user.id}-${name}`)
        }
    }),

    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'image/png') {
            req.file_error = 'only .png image allowed'
            callback(null, false)
        }

        callback(null, true)
    }
}).single('watermark_img')

router.use('/', require('./watermark_collection'))

router.get('/', async (req, res) => {
    const { user, wat_collections } = req.data
    const wats = []

    for (const col of wat_collections) {
        const watermarks = await col.watermarks
        wats.push(...watermarks)
    }

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

router.get('/upload', async (req, res) => {
    const { mode } = req.query

    if (mode) {
        try {
            const user = req.data.user.src
            const gal = await user.gallery
            const cols = await gal.watermark_collections

            if (mode === 'upload') {
                res.render('dashboard_watermark-upload', {
                    cols: cols.map(col => ({ id: col.id, name: col.name }))
                })
            } else if (mode == 'create') {
                res.render('dashboard_editor-watermark', {
                    cols: cols.map(col => ({ id: col.id, name: col.name }))
                })
            }
        } catch (e) {
            console.trace(e)
            return res.redirect('/404')
        }
    } else {
        res.render('dashboard_watermark-choose')
    }
})

router.post('/upload', upload_watermark, async (req, res) => {
    if (req.file_error) {
        console.trace(req.file_error)
        return res.send({ success: false, msg: req.file_error })
    }

    try {
        const watermark_img = req.file
        const { watermark_name, watermark_col } = req.body
        const col = await WatermarkCollection.get(watermark_col)
        const wat = new Watermark(col, watermark_name, moment().toLocaleString())
        const img_path = path.resolve(__dirname, '../../', watermark_img.path)

        await wat.upload(img_path, col.col_dir)
        await wat.save()
        await fs.promises.unlink(img_path)

        if (req.query.test) {
            return res.send({ success: true, id: wat.id })
        }

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.get('/create', (req, res) => {
    res.render('dashboard_editor-watermark')
})

router.post('/create', upload_watermark, async (req, res) => {
    if (req.file_error) {
        return res.send({ success: false, msg: req.file_error })
    }

    try {
        const watermark_img = req.file
        const { watermark_name, watermark_col } = req.body
        const col = await WatermarkCollection.get(watermark_col)
        const wat = new Watermark(col, watermark_name, moment().toLocaleString())
        const img_path = path.resolve(__dirname, '../../', watermark_img.path)

        await wat.upload(img_path, col.col_dir)
        await wat.save()
        await fs.promises.unlink(img_path)

        if (req.query.test) {
            res.send({ success: true, id: wat.id })
        }

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.get('/edit', async (req, res) => {
    try {
        const { user } = req.data
        const wtm = await Watermark.get(req.query.wtm_id)

        res.render('dashboard_edit-details-watermark', {
            user,
            wtm: {
                id: wtm.id,
                title: wtm.name
            }
        })
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

router.post('/edit', async (req, res) => {
    try {
        const wtm = await Watermark.get(req.query.wtm_id)
        const { title } = req.body
        const changes = []

        if (title !== wtm.name) {
            wtm.name = title
            changes.push('title')
        }

        if (changes.length > 0) {
            await wtm.update()

            return res.send({
                success: true,
                changes: changes,
                msg: 'watermark update successful'
            })
        } else {
            return res.send({
                success: false,
                msg: 'nothing to change'
            })
        }
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

router.get('/delete', async (req, res) => {
    try {
        const wtm = await Watermark.get(req.query.wtm_id)

        await wtm.remove_dir()
        await wtm.remove()

        return res.redirect('/profile/watermarks')
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

module.exports = router