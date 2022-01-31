const router = require('express').Router()
const fs = require('fs')
const multer = require('multer')
const slugify = require('slugify')
const path = require('path')
const moment = require('moment')
const Artwork = require('../../models/artwork')
const ArtCollection = require('../../models/art_collection')
const { load_user_dashboard } = require('../middlewares')
const upload_art = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            cb(null, 'uploads/artworks')
        },

        filename: (req, file, callback) => {
            const name = slugify(file.originalname, { lower: true })
            callback(null, `${moment().toDate().getTime()}-${req.data.user.id}-${name}`)
        }
    }),

    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'image/png') {
            req.file_error = 'only .jpg or .jpeg image allowed'
            callback(null, false)
        }

        callback(null, true)
    }
}).single('artwork_img')

router.use('/', load_user_dashboard, require('./artwork_collection'))

router.get('/', load_user_dashboard, async (req, res) => {
    const { user, art_collections } = req.data

    let arts = []

    art_collections.forEach(async (art_col) => {
        const artworks = await art_col.artworks
        arts.push(...artworks)
    })

    arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    const art_cols = await art_collections.map(async art_col => {
        const _arts = await art_col.artworks
        const pic = _arts.length <= 0 ? process.env.COL_PLACEHOLDER : _arts[0].document

        return {
            id: art_col.id,
            title: art_col.name,
            pic: pic
        }
    })

    res.render('dashboard_artworks', {
        user: { id: user.id },

        art_cols: await Promise.all(art_cols),

        arts: arts.map(art => ({
            id: art.id,
            title: art.name,
            pic: art.document
        }))
    })
})

router.get('/upload', load_user_dashboard, async (req, res) => {
    try {
        const user = req.data.user.src
        const gal = await user.gallery
        const art_cols = await gal.art_collections
        const wat_cols = await gal.watermark_collections

        const tmp_wat_cols = Promise.all(wat_cols.map(async (col) => {
            const wats = await col.watermarks
            return {
                name: col.name,
                wats: wats.map(wat => ({
                    name: wat.name,
                    img: wat.document
                }))
            }
        }))

        return res.render('dashboard_editor-artwork', {
            art_cols: art_cols,
            wat_cols: await tmp_wat_cols
        })
    } catch (e) {
        console.trace(e)
        return res.send({ success: false })
    }
})

router.post('/upload', load_user_dashboard, upload_art, async (req, res) => {
    if (req.file_error) {
        console.error(req.file_error)
        return res.send({ success: false, msg: req.file_error })
    }

    try {
        const art_img = req.file
        const { artwork_title, artwork_description, artwork_tags, artwork_col } = req.body
        const col = await ArtCollection.get(artwork_col)
        const art = new Artwork(col, artwork_title, artwork_tags, artwork_description, moment().toDate())
        const img_path = path.resolve(__dirname, '../../', art_img.path)

        await art.upload(img_path, col.col_dir)
        await art.save()
        await fs.promises.unlink(img_path)

        if (req.query.test) {
            return res.send({ success: true, id: art.id })
        }

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.get('/edit', load_user_dashboard, async (req, res) => {
    try {
        const { user } = req.data
        const art = await Artwork.get(req.query.art_id)

        res.render('dashboard_edit-artwork', {
            user,
            art: {
                id: art.id,
                title: art.name,
                description: art.description,
                tags: art.tags
            }
        })
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

router.post('/edit', load_user_dashboard, async (req, res) => {
    try {
        const art = await Artwork.get(req.query.art_id)
        const { title, description, tags } = req.body

        const changes = []

        if (title !== art.name) {
            art.name = title
            changes.push('title')
        }

        if (description !== art.description) {
            art.description = description
            changes.push('description')
        }

        if (tags !== art.tags) {
            art.tags = tags
            changes.push('tags')
        }

        if (changes.length > 0) {
            await art.update()

            return res.send({
                success: true,
                changes: changes,
                msg: 'artwork update successful'
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

router.get('/delete', load_user_dashboard, async (req, res) => {
    try {
        const art = await Artwork.get(req.query.art_id)

        await art.remove()

        return res.redirect('/profile/artworks')
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

module.exports = router