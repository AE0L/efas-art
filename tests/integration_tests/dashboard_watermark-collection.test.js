const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')
const Gallery = require('../../models/gallery')

describe('dashboard (watermark)', () => {

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

    describe('watermark collections', () => {

        const get_test_col = async () => {
            const gal = await test_user.gallery
            const wat_cols = await gal.watermark_collections

            return wat_cols[0]
        }

        test('create watermark collection', async () => {
            const res = await auth_session.post('/profile/watermarks/collection/create')
                .send({
                    col_name: 'Watermark Collection #1',
                    col_desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip'
                })

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe('/profile/watermarks/')
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
        })

        test('retrieve artwork collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get(`/profile/watermarks/collection/${test_col.id}?test=true`)

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')

            const { user, col } = res.body

            expect(user.id).toBe(test_user.id)
            expect(col.id).toBe(test_col.id)
            expect(col.name).toBe(test_col.name)
            expect(col.description).toBe(test_col.desc)
            expect(col.creation_date).toBe(test_col.date)
        })

        test('edit watermark collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.post(`/profile/watermarks/collection/${test_col.id}/edit`)
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
            expect(msg).toBe('watermark collection update successful')
        })

        test(`view all user's watermark collections`, async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get('/profile/watermarks/collections?test=true')

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')

            const { user, wat_cols } = res.body

            expect(user.id).toBe(user.id)
            expect(wat_cols.length).toBe(1)
            expect(wat_cols[0].id).toBe(test_col.id)
            expect(wat_cols[0].title).toBe('test collection name')
            expect(wat_cols[0].pic).toBe(process.env.COL_PLACEHOLDER)
        })

        test('delete watermark collection', async () => {
            const test_col = await get_test_col()
            const res = await auth_session.get(`/profile/watermarks/collection/${test_col.id}/delete`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['location']).toBe('/profile/watermarks/collections')
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
        })
    })

})