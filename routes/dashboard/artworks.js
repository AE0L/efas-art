const router = require('express').Router()
const fs = require('fs')
const multer = require('multer')
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

    fileFilter: (_, file, callback) => {
        if (file.mimetype !== 'image/jpeg') {
            req.file_error = 'only .jpg or .jpeg image allowed'
            callback(null, false)
        }

        callback(null, true)
    }
}).single('art_img')

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
    res.render('dashboard_artwork-editor')
})

router.post('/upload', load_user_dashboard, upload_art, async (req, res) => {
    if (req.file_error) {
        console.error(req.file_error)
        return res.send({ success: false, msg: req.file_error })
    }

    try {
        const art_img = req.file
        const { title, description, tags, col_id } = req.body
        const col = await ArtCollection.get(col_id)
        const art = new Artwork(col, title, tags.split(','), description, moment().toDate(), doc)
        const img_path = path.resolve(__dirname, '../../', art_img.path)

        await art.upload(img_path)
        await art.save()
        await fs.promises.unlink(img_path)

        return res.send({ success: true })
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

module.exports = router