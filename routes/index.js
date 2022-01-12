import express from "express";
import dashboard from './dashboard';
import user from './user';
import artworks from './artworks'
import auth from './auth'
import { authenticate } from './middlewares'

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/home')
    } else {
        res.render('index')
    }
})

router.get('/home', authenticate, (req, res) => {
    res.render('user_works')
})

router.use('/', auth)
router.use('/u', authenticate, user)
router.use('/artworks', authenticate, artworks)
router.use('/profile', authenticate, dashboard)

export default router