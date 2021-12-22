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
        res.redirect('/timeline')
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
    res.render('home')
})

export default router