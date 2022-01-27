const express = require('express')
const router = express.Router()

router.get('/works', async (err, req, res, next) => {
    if (err) {
        res.redirect('/404')
    }

    const { user, art_collections } = req.data
    let arts = []

    art_collections.forEach(async (art_col) => {
        const artworks = await art_col.artworks

        artworks.forEach((artwork) => {
            arts.push(artwork)
        })
    })

    arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    res.render('user_works', {
        user: user,
        works: arts
    })
})


module.exports = router