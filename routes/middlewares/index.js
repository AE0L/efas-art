import User from '../../models/user'

async function load_user(req, res, next) {
    try {
        const uid = req.params.user_id
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

export {
    load_user,
    load_user_dashboard,
    authenticate
}