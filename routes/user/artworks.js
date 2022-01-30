const express = require('express')
const { User } = require('../../models/user')
const router = express.Router()

router.get('/works', async (req, res) => {
    const { user, art_collections } = req.data
    const ses_user = await User.get(req.session.user_id)
    let arts = []

    for (let art_col of art_collections) {
        const artworks = await art_col.artworks

        for (let artwork of artworks) {
            arts.push({
                id: artwork.id,
                title: artwork.name,
                pic: artwork.document
            })
        }
    }

    arts.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))

    return res.render('user_works', {
        user: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            handle: `@${user.username}`,
            pic: user.profile_pic ? user.profile_pic : process.env.PFP_PLACEHOLDER,
            followed: await ses_user.is_following(user)
        },
        works: arts
    })
})


module.exports = router