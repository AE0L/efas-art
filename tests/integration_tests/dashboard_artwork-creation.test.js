const path = require('path')
const fs = require('fs').promises
const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const Artwork = require('../../models/artwork')

describe('watermark creation', () => {
    let ses_user = null
    let ses_con = null
    let ses_auth = null

    const test_art = {
        id: '',
        col: '678875',
        title: 'Test Artwork',
        description: 'Test Description',
        tags: 'test, art, sunset',
        img: null
    }

    beforeAll(async () => {
        ses_con = session(app)
        ses_user = await User.get_user('qweqwe')
        test_art.img = await fs.readFile(path.join(__dirname, 'res/test-art.png'))
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

        const art = await Artwork.get(test_art.id)

        await art.remove()
    })

    test('artwork upload', async () => {
        const res = await ses_auth.post('/profile/artworks/upload?test=true')
            .field('artwork_title', test_art.title)
            .field('artwork_description', test_art.description)
            .field('artwork_tags', test_art.tags)
            .field('artwork_col', test_art.col)
            .attach('artwork_img', test_art.img, 'test-artwork.png')
            .set('content-type', 'multipart/form-data')

        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)

        test_art.id = res.body.id
    })

})