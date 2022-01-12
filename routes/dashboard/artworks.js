import express from 'express'
import ArtCollection from '../../models/art_collection'
import moment from 'moment'
import { load_user_dashboard } from '../middlewares'

const router = express.Router()

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

router.get('/collections', load_user_dashboard, async (req, res) => {
    const { user, art_collections } = req.data

    const art_cols = await art_collections.map(async art_col => {
        const arts = await art_col.artworks
        const pic = arts.length <= 0 ? process.env.COL_PLACEHOLDER : arts[0].document

        return {
            id: art_col.id,
            title: art_col.name,
            pic: pic
        }
    })

    res.render('dashboard_cols-art', {
        user: { id: user.id },
        art_cols: await Promise.all(art_cols)
    })
})

router.get('/collection/create', load_user_dashboard, async (req, res) => {
    res.render('dashboard_create-art-col')
})

router.post('/collection/create', load_user_dashboard, async (req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const { gallery } = req.data
        const art_col = new ArtCollection(gallery, col_name, col_desc, moment())

        await art_col.gen_col_dir()
        await art_col.save()

        res.redirect('/profile/artworks/')
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.get('/collection/:col_id', load_user_dashboard, async (req, res) => {
    try {
        const { user } = req.data
        const col = await ArtCollection.get(req.params.col_id)
        const arts = await col.artworks

        if (col.gallery.user.id !== user.id) {
            return res.redirect('/404')
        }

        res.render('dashboard_col-art', {
            user: { id: user.id },
            col: {
                id: col.id,
                name: col.name,
                desc: col.description,
                date: col.creation_date,
                arts: arts.map(art => ({
                    id: art.id,
                    title: art.name,
                    pic: art.document
                }))
            }
        })
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

export default router