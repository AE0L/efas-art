const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')

describe('dashboard (artworks)', () => {
    let test_user = null
    let ses_user = null
    let test_art = null
    let ses_init = null
    let ses_auth = null

    afterAll(() => {
        app.close()
    })

    beforeAll(async () => {
        test_user = await User.get_user('carlj15')
        const gal = await test_user.gallery
        const cols = (await gal.art_collections)[0]
        test_art = (await cols.artworks)[0]
        ses_init = session(app)
        ses_user = await User.get_user('qweqwe')
    })

    beforeEach((done) => {
        ses_init.post('/login')
            .send({
                username: 'qweqwe',
                password: 'qweqweqwe'
            })
            .expect(200)
            .end((err) => {
                if (err) return done(err)
                ses_auth = ses_init
                return done()
            })
    })

    afterEach(() => {
        ses_auth.get('/logout')
            .expect(200)
    })

    test(`view artwork`, async () => {
        const res = await ses_auth.get(`/artworks/${test_art.id}?test=true`)

        const { user, art } = res.body

        expect(user).toMatchObject({
            id: test_user.id,
            handle: `@${test_user.username}`,
            pfp: process.env.PFP_PLACEHOLDER
        })

        expect(art).toMatchObject({
            id: test_art.id,
            title: test_art.name,
            desc: test_art.description.split('\n'),
            pic: test_art.document,
            tags: test_art.tags.split(','),
            liked: test_art.is_liked(ses_user)
        })
    })

    describe('artwork reactions', () => {
        test('like the artwork', async () => {
            const res = await ses_auth.get(`/artworks/${test_art.id}/like`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe(`/artworks/${test_art.id}`)
            expect(res.header['content-type']).toBe('text/plain; charset=utf-8')
            expect(await test_art.is_liked(ses_user)).toBe(true)
        })

        test('unlike the artwork', async () => {
            const res = await ses_auth.get(`/artworks/${test_art.id}/unlike`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe(`/artworks/${test_art.id}`)
            expect(res.header['content-type']).toBe('text/plain; charset=utf-8')
            expect(await test_art.is_liked(ses_user)).toBe(false)
        })
    })

    describe('artwork comments', () => {
        test('add comment to the artwork', async () => {
            const test_comment = 'this is a test comment text'

            const res = await ses_auth.post(`/artworks/${test_art.id}/comment`)
                .send({
                    comment_text: test_comment
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
        })
    })
})