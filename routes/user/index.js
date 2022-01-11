import express from 'express'
import artworks from './artworks'
import collections from './collections'
import { load_user } from '../middlewares'

const router = express.Router()

router.use('/', artworks)
router.use('/', collections)

router.get('/:user_id/', (req, res) => {
    res.redirect(`/u/${req.params.user_id}/works`)
})

router.get('/:user_id/about', load_user, (req, res) => {
    const { user } = req.data

    res.render('user_about.ejs', {
        user: user
    })
})

export default router