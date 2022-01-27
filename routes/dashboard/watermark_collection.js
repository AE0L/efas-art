const router = require('express').Router()
const WatermarkCollection = require('../../models/watermark_collection')
const moment = require('moment')

router.get('/collections', async (req, res) => {
    const { user, wat_collections } = req.data

    const wat_cols = await wat_collections.map(async wat_col => {
        const wats = await wat_col.watermarks
        const pic = wats.length <= 0 ? process.env.COL_PLACEHOLDER : wats[0].document

        return {
            id: wat_col.id,
            title: wat_col.name,
            pic: pic
        }
    })

    const data = {
        user: { id: user.id },
        wat_cols: await Promise.all(wat_cols)
    }

    return req.query['test'] ? res.send(data) : res.render('dashboard_cols-wtm', data)
})

router.get('/collection/create', async (req, res) => {
    res.render('dashboard_create-wtm-col')
})

router.post('/collection/create', async (req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const { gallery } = req.data
        const wat_col = new WatermarkCollection(gallery, col_name, col_desc, moment().toLocaleString())

        await wat_col.gen_col_dir()
        await wat_col.save()

        res.redirect('/profile/watermarks/')
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.get('/collection/:col_id', async (req, res) => {
    try {
        const { user } = req.data
        const col = await WatermarkCollection.get(req.params.col_id)
        const wats = await col.watermarks

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
                wats: wats.map(wat => ({
                    id: wat.id,
                    title: wat.name,
                    pic: wat.document
                }))
            }
        }

        return req.query['test'] ? res.send(data) : res.render('dashboard_col-wtm', data)
    } catch (err) {
        console.error(err)
        res.redirect('/404')
    }
})

router.post('/collection/:col_id/edit', async (req, res) => {
    try {
        const { col_name, col_desc } = req.body
        const wat_col = await WatermarkCollection.get(req.params.col_id)
        const changes = []

        if (wat_col.name !== col_name) {
            wat_col.name = col_name
            changes.push('name')
        }

        if (wat_col.description !== col_desc) {
            wat_col.description = col_desc
            changes.push('description')
        }

        if (changes.length > 0) {
            await wat_col.update()

            return res.send({
                success: true,
                changes: changes,
                msg: 'watermark collection update successful'
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
        const wat_col = await WatermarkCollection.get(req.params.col_id)

        await wat_col.remove_dir()
        await wat_col.remove()

        res.redirect('/profile/watermarks/collections')
    } catch (e) {
        console.trace(e)
        res.redirect('/404')
    }
})


module.exports = router