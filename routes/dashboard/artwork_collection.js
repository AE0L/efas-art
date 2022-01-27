const router = require('express').Router()
const ArtCollection = require('../../models/art_collection')
const moment = require('moment')

router.get('/collections', async (req, res) => {
    const { user, art_collections } = req.data

    const art_cols = await art_collections.map(async art_col => {
        const arts = await art_col.artworks
        const pic = arts.length <= 0 ? process.env.COL_PLACEHOLDER : arts[0].document

        return {
            id: art_col.id,
            title: art_col.name,
            pic: pic
        }
    })

    const data = {
        user: { id: user.id },
        art_cols: await Promise.all(art_cols)
    }

    return req.query['test'] ? res.send(data) : res.render('dashboard_cols-art', data)
})

router.get('/collection/create', async (req, res) => {
    res.render('dashboard_create-art-col')
})

router.post('/collection/create', async (req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const { gallery } = req.data
        const art_col = new ArtCollection(gallery, col_name, col_desc, moment().toLocaleString())

        await art_col.gen_col_dir()
        await art_col.save()

        res.redirect('/profile/artworks/')
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.get('/collectin/edit', async (req, res) => {

})

router.get('/collection/:col_id', async (req, res) => {
    try {
        const { user } = req.data
        const col = await ArtCollection.get(req.params.col_id)
        const arts = await col.artworks

        if (col.gallery.user.id !== user.id) {
            return res.redirect('/404')
        }

        const data = {
            user: { id: user.id },
            col: {
                id: col.id,
                name: col.name,
                desc: col.description,
                date: col.creation_date,
                arts: arts.map(art => ({
                    id: art.id,
                    title: art.name,
                    pic: art.document
                }))
            }
        }

        return req.query['test'] ? res.send(data) : res.render('dashboard_col-art', data)
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.post('/collection/:col_id/edit', async (req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const art_col = await ArtCollection.get(req.params.col_id)
        const changes = []

        if (art_col.name !== col_name) {
            art_col.name = col_name
            changes.push('name')
        }

        if (art_col.description !== col_desc) {
            art_col.description = col_desc
            changes.push('description')
        }

        if (changes.length > 0) {
            await art_col.update()

            return res.send({
                success: true,
                changes: changes,
                msg: 'art collection update successful'
            })
        } else {
            return res.send({
                success: false,
                errors: [{
                    msg: 'nothing to change'
                }]
            })
        }
    } catch (e) {
        console.trace(e)
        return res.redirect('/404')
    }
})

router.get('/collection/:col_id/delete', async (req, res) => {
    try {
        const art_col = await ArtCollection.get(req.params.col_id)

        await art_col.remove_dir()
        await art_col.remove()

        res.redirect('/profile/artworks/collections')
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})

module.exports = router