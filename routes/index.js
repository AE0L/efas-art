/** Base Router
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import express from 'express'
const router = express.Router()

router.use('/', require('./auth'))
router.use('/user', require('./gallery'))

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
router.get('/timeline', (req, res) => {
    res.render('timeline')
})

export default router