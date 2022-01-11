import express from 'express'
import ArtCollection from '../../models/art_collection'

const router = express.Router()

router.get('/', async (req, res) => {
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
            name: art_col.name,
            pic: _arts[0].document
        }
    })

    res.render('dashboard_artworks', {
        user: { id: user.id },

        art_cols: art_cols,

        arts: arts.map(art => {
            return {
                id: art.id,
                name: art.name,
                pic: art.document
            }
        })
    })
})

router.get('/collections', async (req, res) => {
    const { user, art_collections } = req.data

    const art_cols = await art_collections.map(async art_col => {
        const arts = await art_col.artworks

        return {
            name: art_col.name,
            pic: arts[0].document
        }
    })

    res.render('dashboard_cols-art', {
        user: { id: user.id },
        art_cols: art_cols
    })
})

router.get('/collection/:col_id', async (req, res) => {
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