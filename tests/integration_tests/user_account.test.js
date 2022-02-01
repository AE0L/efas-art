const session = require('supertest-session')
const request = require('supertest')
const app = require('../../app_test')
const { User } = require('../../models/user')
const { inspect } = require('util')

describe('user account', () => {

    afterAll(async () => {
        const user = await User.get_user('john_doe')

        user.remove_dir()
        user.remove()
    })

    describe('register account', () => {
        test('successful account creation', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    username: 'john_doe',
                    password: 'john.doe2021',
                    email: 'john_doe@email.com'
                })
            
            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(true)
            expect(res.body.msg).toBe('account creation was successful')
        })

        test('username already exist', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: '',
                    last_name: '',
                    username: 'john_doe',
                    password: '12345678',
                    email: 'test@email.com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.errors[0].value).toBe('john_doe')
            expect(res.body.errors[0].param).toBe('username')
            expect(res.body.errors[0].msg).toBe('username already exists')
        })

        test('username too short', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: '',
                    last_name: '',
                    username: 'jon',
                    password: '12345678',
                    email: 'test@email.com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.errors[0].value).toBe('jon')
            expect(res.body.errors[0].param).toBe('username')
            expect(res.body.errors[0].msg).toBe('username invalid length')
        })

        test('email already registered', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: '',
                    last_name: '',
                    username: '1234',
                    password: '12345678',
                    email: 'john_doe@email.com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.errors[0].value).toBe('john_doe@email.com')
            expect(res.body.errors[0].param).toBe('email')
            expect(res.body.errors[0].msg).toBe('email is already registered')
        })

        test('invalid email', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: '',
                    last_name: '',
                    username: '1234',
                    password: '12345678',
                    email: 'john_doe!email_com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.errors[0].value).toBe('john_doe!email_com')
            expect(res.body.errors[0].param).toBe('email')
            expect(res.body.errors[0].msg).toBe('invalid email')
        })

        test('password too short', async () => {
            const res = await request(app)
                .post('/register')
                .send({
                    first_name: '',
                    last_name: '',
                    username: '1234',
                    password: 'abc123',
                    email: 'test@email.com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.errors[0].value).toBe('abc123')
            expect(res.body.errors[0].param).toBe('password')
            expect(res.body.errors[0].msg).toBe('password invalid length')
        })
    })

    describe('authenticate account', () => {
        test('login user', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'john_doe',
                    password: 'john.doe2021'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(true)
            expect(res.body.msg).toBe('login successful')
        })

        test('username not registered', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'jon_dow',
                    password: 'john.doe2021'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.value).toBe('jon_dow')
            expect(res.body.param).toBe('username')
            expect(res.body.msg).toBe('username not registered')
        })

        test('incorrect password', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: 'john_doe',
                    password: 'jon_dow123'
                })

            expect(res.statusCode).toBe(200)
            expect(res.headers['content-type']).toBe('application/json; charset=utf-8')
            expect(res.body.success).toBe(false)
            expect(res.body.value).toBe('jon_dow123')
            expect(res.body.param).toBe('password')
            expect(res.body.msg).toBe('incorrect password')
        })
    })

    describe('personalize account details', () => {
        let user_session = null
        let auth_session = null

        beforeAll(() => {
            user_session = session(app)
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

        describe('profile details', () => {
            test('edit first name', async () => {
                const edit = await auth_session.post('/profile/settings/edit/profile')
                    .send({
                        first_name: 'Rick',
                        last_name: 'Doe',
                        bio: ''
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(true)
                expect(edit.body.changes).toContain('first_name')
                expect(edit.body.msg).toBe('profile update successful')
            })

            test('edit last name', async () => {
                const edit = await auth_session.post('/profile/settings/edit/profile')
                    .send({
                        first_name: 'Rick',
                        last_name: 'Astley',
                        bio: ''
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(true)
                expect(edit.body.changes).toContain('last_name')
                expect(edit.body.msg).toBe('profile update successful')
            })

            test('edit bio', async () => {
                const edit = await auth_session.post('/profile/settings/edit/profile')
                    .send({
                        first_name: 'Rick',
                        last_name: 'Smith',
                        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(true)
                expect(edit.body.changes).toContain('bio')
                expect(edit.body.msg).toBe('profile update successful')
            })
        })

        describe('security details', () => {
            test('incorrect current password', async () => {
                const edit = await auth_session.post('/profile/settings/edit/security')
                    .send({
                        cur_pass: 'john_smith.2000',
                        new_pass: 'john_doe2022'
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(false)
                expect(edit.body.errors[0].param).toBe('cur_pass')
                expect(edit.body.errors[0].msg).toBe('incorrect password')
            })

            test('same current password & new password', async () => {
                const edit = await auth_session.post('/profile/settings/edit/security')
                    .send({
                        cur_pass: 'john.doe2021',
                        new_pass: 'john.doe2021'
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(false)
                expect(edit.body.errors[0].param).toBe('new_pass')
                expect(edit.body.errors[0].msg).toBe('new password is the same as current password')
            })

            test('change password successful', async () => {
                const edit = await auth_session.post('/profile/settings/edit/security')
                    .send({
                        cur_pass: 'john.doe2021',
                        new_pass: 'john_doe2022'
                    })

                expect(edit.statusCode).toBe(200)
                expect(edit.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(edit.body.success).toBe(true)
                expect(edit.body.msg).toBe('password update successful')
            })
        })
    })

    describe('follows', () => {
        const follow_user = '441171'
        let user_session = null
        let auth_session = null

        beforeAll(() => {
            user_session = session(app)
        })

        beforeEach((done) => {
            user_session.post('/login')
                .send({
                    username: 'john_doe',
                    password: 'john_doe2022'
                })
                .expect(200)
                .end((err) => {
                    if (err) return done(err)
                    auth_session = user_session
                    return done()
                })
        })

        test('follow user', async () => {
            const res = await auth_session.get(`/u/${follow_user}/follow?page=work`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
            expect(res.headers['location']).toBe(`/u/${follow_user}/work`)
        })

        test('unfollow user', async () => {
            const res = await auth_session.get(`/u/${follow_user}/unfollow?page=work`)

            expect(res.statusCode).toBe(302)
            expect(res.headers['content-type']).toBe('text/plain; charset=utf-8')
            expect(res.headers['location']).toBe(`/u/${follow_user}/work`)
        })
    })

})