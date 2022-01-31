const user_mod = require('../../models/user')
const { User, encrypt_password } = user_mod
const Follow = require('../../models/follow')
const { google } = require('googleapis')
const { users, create_sample_user } = require('../samples');

describe('User unit test', () => {

    let test_user = null
    let test_user2 = null

    test('user model constructor', () => {
        const { id, first_name, last_name, username, password } = users[0]
        const user = create_sample_user(users[0], true)

        expect(user.id).toBe(id)
        expect(user.first_name).toBe(first_name)
        expect(user.last_name).toBe(last_name)
        expect(user.username).toBe(username)
        expect(user.password).toBe(password)
    })

    test('user encrypt pass', async () => {
        const user = create_sample_user(users[0], true)
        const { password, salt } = users[0]
        const test_pass = await encrypt_password(password, salt)

        await user.hash_pass(salt)

        expect(user.hash).toBe(test_pass)
    })

    test('save & retrieve user in db', async () => {
        test_user = create_sample_user(users[0])

        await test_user.hash_pass()

        const res = await test_user.save()

        expect(res.changes).toBe(1)

        const { first_name, last_name, username, root_dir } = users[0]
        const get_user = await User.get(test_user.id)

        expect(get_user.id).toBe(test_user.id)
        expect(get_user.first_name).toBe(first_name)
        expect(get_user.last_name).toBe(last_name)
        expect(get_user.username).toBe(username)
        expect(get_user.root_dir).toBe(root_dir)
    })

    test('verify user password', async () => {
        const { password } = users[0]
        const user = await User.get(test_user.id)
        const auth = await user.verify_pass(password)

        expect(auth).toBe(true)
    })

    test('follow another user', async () => {
        test_user2 = create_sample_user(users[1])

        await test_user2.hash_pass()
        await test_user2.save()

        const user_1 = await User.get(test_user.id)
        const res = await user_1.follow(test_user2)

        expect(res.changes).toBe(1)
    })

    test('get followers', async () => {
        const user_1 = await User.get(test_user.id)
        const user_2 = await User.get(test_user2.id)
        const follows = await user_1.get_follows()

        expect(follows[0].user.id).toBe(user_1.id)
        expect(follows[0].followed.id).toBe(user_2.id)
    })

    test('unfollow user', async () => {
        const user_1 = await User.get(test_user.id)
        const user_2 = await User.get(test_user2.id)
        const res = await user_1.unfollow(user_2)
        const follow = await Follow.get(user_1, user_2)

        expect(res.changes).toBe(1)
        expect(follow).toBeUndefined()
    })

    test('create & remove user\'s gdrive directory', async () => {
        const drive = google.drive({ version: 'v3', auth: global.gauth })
        const user = create_sample_user(users[0])

        await user.hash_pass()
        await user.gen_root_dir()

        const res = await drive.files.get({
            fileId: user.root_dir,
            fields: 'id, name'
        })

        expect(res.data.id).toBe(user.root_dir)
        expect(res.data.name).toBe(user.id)

        const rem_res = await user.remove_dir()

        expect(rem_res.data).toBe('')

        user.remove()
    })
    test('remove user from db', async () => {
        const user_1 = await User.get(test_user.id)
        const user_2 = await User.get(test_user2.id)
        const res_1 = await user_1.remove()
        const res_2 = await user_2.remove()

        expect(res_1.changes).toBe(1)
        expect(res_2.changes).toBe(1)
        expect(await User.get(test_user.id)).toBeUndefined()
        expect(await User.get(test_user2.id)).toBeUndefined()
    })
})