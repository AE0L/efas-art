const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')
const Gallery = require('../../models/gallery')

describe('dashboard (artwork)', () => {

    let test_user = null
    let user_session = null
    let auth_session = null

    beforeAll(async () => {
        user_session = session(app)
        test_user = new User(
            'John',
            'Doe',
            'john_doe',
            'john.doe2021'
        )

        await test_user.hash_pass()
        await test_user.gen_root_dir()
        await test_user.save()

        const test_gallery = new Gallery(
            test_user
        )

        await test_gallery.gen_art_col_dir()
        await test_gallery.gen_watermark_col_dir()
        await test_gallery.save()

        test_user.gallery = test_gallery
    })

    beforeEach((done) => {
        user_session.post('/login')
            .send({
                username: 'john_doe',
                password: 'john.doe2021'
            })
            .expect(200)
            .end((err) => {
                if (err) return done(err)
                auth_session = user_session
                return done()
            })
    })

    afterAll(async () => {
        await test_user.remove_dir()
        await test_user.remove()
    })

    describe('artwork collections', () => {

        const get_test_col = async () => {
            const gal = await test_user.gallery
            const art_cols = await gal.art_collections

            return art_cols[0]
        }

        test('create artwork collection', async () => {
            const res = await auth_session.post('/profile/artworks/collection/create')
                .send({
                    col_name: 'Collection #1',
                    col_desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip'
                })

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe('/profile/artworks/')
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
        })

        test('retrieve artwork collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get(`/profile/artworks/collection/${test_col.id}?test=true`)

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')

            const { user, col } = res.body

            expect(user.id).toBe(test_user.id)
            expect(col.id).toBe(test_col.id)
            expect(col.name).toBe(test_col.name)
            expect(col.description).toBe(test_col.desc)
            expect(col.creation_date).toBe(test_col.date)
        })

        test('edit artwork collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.post(`/profile/artworks/collection/${test_col.id}/edit`)
                .send({
                    col_name: 'test collection name',
                    col_desc: 'test collection description'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')

            const { success, changes, msg } = res.body

            expect(success).toBe(true)
            expect(changes).toContain('name')
            expect(changes).toContain('description')
            expect(msg).toBe('art collection update successful')
        })

        test(`view all user's artwork collections`, async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get('/profile/artworks/collections?test=true')

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')

            const { user, art_cols } = res.body

            expect(user.id).toBe(user.id)
            expect(art_cols.length).toBe(1)
            expect(art_cols[0].id).toBe(test_col.id)
            expect(art_cols[0].title).toBe('test collection name')
            expect(art_cols[0].pic).toBe(process.env.COL_PLACEHOLDER)
        })

        test('delete artwork collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get(`/profile/artworks/collection/${test_col.id}/delete`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe('/profile/artworks/collections')
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
        })
    })

})