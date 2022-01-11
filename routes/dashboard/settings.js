import express from 'express'

const router = express.Router()

router.get('/settings', (req, res) => {
    const setting = req.query['s']

    if (setting) {
        switch (setting) {
            case 'prof':
                return res.render('dashboard_settings-profile')
            case 'sec':
                return res.render('dashboard_settings-security')
            case 'notif':
                return res.render('dashboard_settings-notification')
        }
    } else {
        return res.render('dashboard_settings-profile')
    }
})


export default router