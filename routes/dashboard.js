import express from 'express'

const router = express.Router()

function load_col(req, res, next) {
    req.art_col = {
        name: 'Cactus Collection',
        id: '123456'
    }

    next()
}

router.get('/profile', (req, res) => {
    res.render('dashboard_home.ejs')
})

router.get('/profile/artworks', (req, res) => {
    res.render('dashboard_artworks')
})

router.get('/profile/artworks/collections', (req, res) => {
    res.render('dashboard_cols-art')
})

router.get('/profile/artworks/collection/:col_id', load_col, (req, res) => {
    res.render('dashboard_col-art', { col: req.art_col })
})

router.get('/profile/watermarks/collections', (req, res) => {
    res.render('dashboard_cols-wtm')
})

router.get('/profile/watermarks/collection/:col_id', load_col, (req, res) => {
    res.render('dashboard_col-wtm', { col: req.art_col })
})


router.get('/profile/watermarks', (req, res) => {
    res.render('dashboard_watermarks')
})

router.get('/profile/settings', (req, res) => {
    const setting = req.query['s']

    if (setting) {
        switch (setting) {
            case 'prof':
                return res.render('dashboard_settings-profile')
            case 'sec':
                return res.render('dashboard_settings-security')
            case 'notif':
                return res.render('dashboard_settings-notification')
        }
    } else {
        return res.render('dashboard_settings-profile')
    }
})

export default router