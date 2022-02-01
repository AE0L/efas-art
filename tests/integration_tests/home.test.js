const session = require('supertest-session')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')

describe('watermark creation', () => {
    let ses_user = null
    let ses_con = null
    let ses_auth = null

    beforeAll(async () => {
        ses_con = session(app)
        ses_user = await User.get_user('qweqwe')
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

    test(`retrieve followed artists' recent artworks`, async () => {
        const res = await ses_auth.get('/home?test=true')

        expect(res.statusCode).toBe(200)
        expect(res.body.user.id).toBe(ses_user.id)
        expect(res.body.works.length).toBeGreaterThan(0)
    })
})