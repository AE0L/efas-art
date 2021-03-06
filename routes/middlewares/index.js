const { User } = require('../../models/user')
const Artwork = require('../../models/artwork')
const Notification = require('../../models/notification')
const moment = require('moment')

async function load_user(req, _, next) {
    try {
        const uid = req.params.user_id
        const ses_user = await User.get(req.session.user_id)
        const user = await User.get(uid)
        const gallery = await user.gallery
        const art_cols = await gallery.art_collections
        const wat_cols = await gallery.watermark_collections

        req.data = {
            ses_user: ses_user,
            user: user,
            gallery: gallery,
            art_collections: art_cols,
            wat_collections: wat_cols
        }

        next()
    } catch (err) {
        console.trace(err)
        next(err)
    }
}

async function load_user_dashboard(req, _, next) {
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

async function load_artwork(req, _, next) {
    const { artwork_id } = req.params
    const ses_user = await User.get(req.session.user_id)
    const art = await Artwork.get(artwork_id)
    const col = art.art_col
    const gallery = col.gallery
    const user = gallery.user

    req.data = {
        ses_user: ses_user,
        user: user,
        gallery: gallery,
        col: col,
        art: art
    }

    next()
}

function create_art_notif(type) {
    return (req, _, next) => {
        const { user, ses_user, art } = req.data
        const notif = new Notification(ses_user, user, type, art.id, moment().toLocaleString())

        req.data.notif = notif

        next()
    }
}

function create_user_notif(type) {
    return (req, _, next) => {
        const { user, ses_user } = req.data
        const notif = new Notification(ses_user, user, type, null, moment().toLocaleString())

        req.data.notif = notif

        next()
    }
}

module.exports = {
    load_user,
    load_user_dashboard,
    authenticate,
    load_artwork,
    create_art_notif,
    create_user_notif
}