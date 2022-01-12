import express from 'express'
import ArtCollection from '../../models/art_collection'
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

        return {
            id: art_col.id,
            title: art_col.name,
            pic: _arts[0].document
        }
    })

    res.render('dashboard_artworks', {
        user: { id: user.id },

        art_cols: art_cols,

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

        return {
            id: art_col.id,
            name: art_col.name,
            pic: arts[0].document
        }
    })

    res.render('dashboard_cols-art', {
        user: { id: user.id },
        art_cols: art_cols
    })
})

router.get('/collection/:col_id', load_user_dashboard, async (req, res) => {
    const { user } = req.data
    const col = await ArtCollection.get(req.params.col_id)
    const artworks = await col.artworks

    if (col.gallery.user.id !== user.id) {
        return res.redirect('/404')
    }

    res.render('dashboard_col-art', {
        user: { id: user.id },
        col: {
            id: col.id,
            name: col.name,
            desc: col.description,
            arts: artworks.map(artwork => ({ name: artwork.name, pic: artwork.document }))
        }
    })
})

export default router