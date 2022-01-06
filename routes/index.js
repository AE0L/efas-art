import express from "express";
import dashboard from './dashboard';
import user from './user';

const router = express.Router()

router.get('/', (req, res) => {
    res.render('user_works')
})

router.use(user)
router.use(dashboard)

export default router