const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')
const fs = require('fs').promises
const moment = require('moment')
const path = require('path')
const Artwork = require('../../models/artwork')
const ArtCollection = require('../../models/art_collection')
const { random_id } = require('../../models/util')

describe('artwork creation', () => {
    let ses_user = null
    let ses_con = null
    let ses_auth = null

    let test_art = null
    let test_data = {
        title: 'test title',
        description: 'test description',
        tags: 'test tags',
        art_col: '678875',
        img: null
    }

    beforeAll(async () => {
        ses_con = session(app)
        ses_user = await User.get_user('qweqwe')
        test_data.img = path.join(__dirname, 'res/test-art.png')

        const { title, description, tags, art_col, img } = test_data
        const col = await ArtCollection.get(art_col)
        const art = new Artwork(col, title, tags, description, moment().toLocaleString())

        await art.upload(img, col.col_dir)
        await art.save()

        test_art = art
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

    test(`edit artwork details`, async () => {
        const res = await ses_auth.post(`/profile/artworks/edit?art_id=${test_art.id}`)
            .send({
                title: 'new title',
                description: 'new description',
                tags: 'new, tags'
            })

        expect(res.statusCode).toBe(200)

        const { success, changes, msg } = res.body

        expect(success).toBe(true)
        expect(changes).toContain('title')
        expect(changes).toContain('description')
        expect(changes).toContain('tags')
        expect(msg).toBe('artwork update successful')
    })

    test(`delete artwork`, async () => {
        const res = await ses_auth.get(`/profile/artworks/delete?art_id=${test_art.id}`)

        expect(res.statusCode).toBe(302)
        expect(res.headers['location']).toBe('/profile/artworks')
    })

})