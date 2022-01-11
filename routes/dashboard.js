import express from 'express'

const router = express.Router()

function load_col(req, res, next) {
    req.art_col = {
        name: 'Cactus Collection',
        id: '123456'
    }

    next()
}

// router.get('/profile/artworks', (req, res) => {
//     res.render('dashboard_artworks')
// })

// router.get('/profile/artworks/collections', (req, res) => {
//     res.render('dashboard_cols-art')
// })

// router.get('/profile/artworks/collection/:col_id', load_col, (req, res) => {
//     res.render('dashboard_col-art', { col: req.art_col })
// })

// router.get('/profile/watermarks/collections', (req, res) => {
//     res.render('dashboard_cols-wtm')
// })

// router.get('/profile/watermarks/collection/:col_id', load_col, (req, res) => {
//     res.render('dashboard_col-wtm', { col: req.art_col })
// })


// router.get('/profile/watermarks', (req, res) => {
//     res.render('dashboard_watermarks')
// })


export default router