import express from 'express'
import { load_user_dashboard } from '../middlewares'

const router = express.Router()

router.get('/', load_user_dashboard, (req, res) => {
    const setting = req.query['s']

    if (setting) {
        switch (setting) {
            case 'prof':
                const { src: user } = req.data.user
                return res.render('dashboard_settings-profile', {
                    data: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        bio: user.bio
                    }
                })
            case 'sec':
                return res.render('dashboard_settings-security')
            case 'notif':
                return res.render('dashboard_settings-notification')
        }
    } else {
        const { src: user } = req.data.user
        return res.render('dashboard_settings-profile', {
            data: {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                bio: user.bio

            }
        })
    }
})


export default router