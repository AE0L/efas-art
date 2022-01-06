/** Base Router
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import express from 'express'
import path from 'path'
const router = express.Router()

router.use('/', require('./auth'))
router.use('/', require('./gallery'))

/**
 * @swagger
 * /:
 *  get:
 *      summary: serve index page
 */
router.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/home')
    }

    res.render('index')
})

/**
 * @swagger
 * /timeline:
 *  get:
 *      summary: server timeline page
 */
router.get('/home', (req, res) => {
    res.render('works')
})

router.get('/profile', (req, res) => {
    res.render('profile')
})

router.get('/works', (req, res) => {
    res.render('works')
})

router.get('/collections', (req, res) => {
    res.render('collections')
})

router.get('/watermarks', (req, res) => {
    res.render('watermarks')
})

router.get('/settings', (req, res) => {
    res.render('settings')
})

export default router