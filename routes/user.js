import express from "express";

const router = express.Router()

function load_user(req, res, next) {
    req.user_name = 'John Doe'
    req.user_handle = '@john_doe'

    next()
}

function load_art(req, res, next) {
    req.art_name = 'Cupcake'
    
    next()
}

function load_col(req, res, next) {
    req.art_col = {
        name: 'Cactus collection',
        id: req.params.col_id
    }

    next()
}

router.get('/u/:user_id/', (req, res) => {
    res.redirect(`/u/${req.params.user_id}/works`)
})

router.get('/u/:user_id/works', load_user, (req, res) => {
    res.render('user_works')
})

router.get('/u/:user_id/collections', load_user, (req, res) => {
    res.render('user_collections')
})

router.get('/u/:user_id/about', load_user, (req, res) => {
    res.render('user_about.ejs')
})

router.get('/artworks/:art_id', load_art, (req, res) => {
    res.render('user_showcase-artwork')
})

router.get('/collection/:col_id', load_col, (req, res) => {
    res.render('user_showcase-collection', {
        col_name: req.art_col.name,
        col_id: req.art_col.id
    })
})

export default router