const { User } = require('../../models/user')
const Artwork = require('../../models/artwork')

async function load_user(req, res, next) {
    try {
        const uid = req.params.user_id
        const user = await User.get(uid)
        const gallery = await user.gallery
        const art_cols = await gallery.art_collections
        const wat_cols = await gallery.watermark_collections

        req.data = {
            user: user,
            gallery: gallery,
            art_collections: art_cols,
            wat_collections: wat_cols
        }

        next()
    } catch (err) {
        console.error(err)
        next(err)
    }
}

async function load_user_dashboard(req, res, next) {
    try {
        const uid = req.session.user_id
        const user = await User.get(uid)
        const gallery = await user.gallery
        const art_cols = await gallery.art_collections
        const wat_cols = await gallery.watermark_collections

        req.data = {
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                handle: `@${user.username}`,
                src: user
            },
            gallery: gallery,
            art_collections: art_cols,
            wat_collections: wat_cols
        }

        next()
    } catch (err) {
        next(err)
    }
}

async function authenticate(req, res, next) {
    if (req.session.user_id) {
        next()
    } else {
        res.redirect('/')
    }
}

async function load_artwork(req, res, next) {
    const { artwork_id } = req.params
    const art = await Artwork.get(artwork_id)
    const col = art.art_col
    const gallery = col.gallery
    const user = gallery.user

    req.data = {
        user: user,
        gallery: gallery,
        col: col,
        art: art
    }

    next()
}

module.exports = {
    load_user,
    load_user_dashboard,
    authenticate,
    load_artwork
}