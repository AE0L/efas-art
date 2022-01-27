const express = require('express')
const { load_user } = require('../middlewares')
const ArtCollection = require('../../models/art_collection')

const router = express.Router()

router.get('/collections', (req, res) => {
    const { user, art_collections } = req.data

    const cols = art_collections.map(art_col => {
        return {
            name: art_col.name,
            desc: art_col.description
        }
    })

    res.render('user_collections', {
        user: user,
        cols: cols
    })
})

router.get('/collection/:col_id', async (req, res) => {
    const { user } = req.data
    const art_col = await ArtCollection.get(req.params.col_id)
    const artworks = await art_col.artworks

    res.render('user_showcase-collection', {
        user: user,
        col: {
            name: art_col.name,
            desc: art_col.description,
            arts: artworks.map(art => {
                return {
                    name: art.name,
                    pic: art.document
                }
            })
        }
    })
})

module.exports = router