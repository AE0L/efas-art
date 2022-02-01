const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')
const fs = require('fs').promises
const moment = require('moment')
const path = require('path')
const Watermark = require('../../models/watermark')
const WatermarkCollection = require('../../models/watermark_collection')
const { random_id } = require('../../models/util')

describe('artwork creation', () => {
    let ses_user = null
    let ses_con = null
    let ses_auth = null

    let test_wtm = null
    let test_data = {
        name: 'test name',
        wtm_col: '128572',
        img: null
    }

    beforeAll(async () => {
        ses_con = session(app)
        ses_user = await User.get_user('qweqwe')
        test_data.img = path.join(__dirname, 'res/test-wtm.png')

        const { name, wtm_col, img } = test_data
        const col = await WatermarkCollection.get(wtm_col)
        const wtm = new Watermark(col, name, moment().toLocaleString())

        await wtm.upload(img, col.col_dir)
        await wtm.save()

        test_wtm = wtm
    })

    beforeEach((done) => {
        ses_con.post('/login')
            .send({
                username: 'qweqwe',
                password: 'asdfasdfasdf'
            })
            .expect(200)
            .end((err) => {
                if (err) return done(err)
                ses_auth = ses_con
                return done()
            })
    })

    afterEach(async () => {
        ses_auth.get('/logout')
            .expect(200)
    })

    afterAll(() => {
        ses_con.destroy()
    })

    test(`edit watermark details`, async () => {
        const res = await ses_auth.post(`/profile/watermarks/edit?wtm_id=${test_wtm.id}`)
            .send({ title: 'new title' })

        expect(res.statusCode).toBe(200)

        const { success, changes, msg } = res.body

        expect(success).toBe(true)
        expect(changes).toContain('title')
        expect(msg).toBe('watermark update successful')
    })

    test(`delete artwork`, async () => {
        const res = await ses_auth.get(`/profile/watermarks/delete?wtm_id=${test_wtm.id}`)

        expect(res.statusCode).toBe(302)
        expect(res.headers['location']).toBe('/profile/watermarks')
    })

})