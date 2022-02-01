const router = require('express').Router()

router.get('/', async (req, res) => {
    try {
        const user = req.data.user.src
        const likes = await user.get_likes()

        return res.render('dashboard_bookmarks', {
            user: { 
                id: user.id            },
            bookmarks: likes.map(like => ({
                id: like.artwork.id,
                user: like.artwork.art_col.gallery.user.username,
                title: like.artwork.name,
                pic: like.artwork.document
            }))
        })
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

module.exports = router