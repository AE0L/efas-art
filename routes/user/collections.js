const express = require('express')
const { load_user } = require('../middlewares')
const ArtCollection = require('../../models/art_collection')
const { User } = require('../../models/user')

const router = express.Router()

router.get('/collections', async (req, res) => {
    const { user, art_collections } = req.data
    const ses_user = await User.get(req.session.user_id)

    const art_cols = await Promise.all(art_collections.map(async art_col => {
        const _arts = await art_col.artworks
        const pic = _arts.length <= 0 ? process.env.COL_PLACEHOLDER : _arts[0].document

        return {
            id: art_col.id,
            title: art_col.name,
            description: art_col.description,
            pic: pic
        }
    }))

    res.render('user_collections', {
        user: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            handle: `@${user.username}`,
            pic: user.profile_pic ? user.profile_pic : process.env.PFP_PLACEHOLDER,
            followed: await ses_user.is_following(user)
        },
        cols: art_cols
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