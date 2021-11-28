/** Base Router
 * @module routes/
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import express from 'express'
const router = express.Router()

router.use('/', require('./auth'))

/** GET /
 * @summary index page
 */
router.get('/', (req, res) => {
    res.render('index')
})

/** GET /timeline
 * @summary timeline page
 */
router.get('/timeline', (req, res) => {
    res.render('timeline')
})

module.exports = router
