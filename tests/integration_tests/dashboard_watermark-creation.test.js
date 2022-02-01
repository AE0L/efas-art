const path = require('path')
const fs = require('fs').promises
const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const Watermark = require('../../models/watermark')

describe('watermark creation', () => {
    let ses_user = null
    let ses_con = null
    let ses_auth = null

    const test_wtm = {
        id: '',
        col: '128572',
        name: 'Test Watermark',
        img: null
    }

    beforeAll(async () => {
        ses_con = session(app)
        ses_user = await User.get_user('qweqwe')
        test_wtm.img = await fs.readFile(path.join(__dirname, 'res/test-wtm.png'))
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

        const wtm = await Watermark.get(test_wtm.id)

        await wtm.remove()
    })

    test('watermark upload', async () => {
        const res = await ses_auth.post('/profile/watermarks/upload?test=true')
            .field('watermark_name', test_wtm.name)
            .field('watermark_col', test_wtm.col)
            .attach('watermark_img', test_wtm.img, 'test-watermark.png')
            .set('content-type', 'multipart/form-data')

        expect(res.statusCode).toBe(200)

        const { success, id } = res.body

        expect(success).toBe(true)

        test_wtm.id = id
    })

    test('watermark creation', async () => {
        const res = await ses_auth.post('/profile/watermarks/upload?test=true')
            .field('watermark_name', test_wtm.name)
            .field('watermark_col', test_wtm.col)
            .attach('watermark_img', test_wtm.img, 'test-watermark.png')
            .set('content-type', 'multipart/form-data')

        expect(res.statusCode).toBe(200)

        const { success, id } = res.body

        expect(success).toBe(true)

        test_wtm.id = id
    })

})