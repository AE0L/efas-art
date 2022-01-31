const { User } = require('../../models/user');
const { users, create_sample_user, create_sample_contact } = require('../samples')

describe('Contact unit test', () => {

    let test_user = null

    test('contact model constructor', () => {
        const user = create_sample_user(users[0], true)
        const contact = create_sample_contact(user, users[0].contact)

        expect(contact.id).toBe(users[0].contact.id)
        expect(contact.user.id).toBe(user.id)
        expect(contact.email).toBe(users[0].contact.email)
        expect(contact.phone).toBe(users[0].contact.phone)
    })

    test('save contact model to db', async () => {
        const user = create_sample_user(users[0], true)

        await user.hash_pass()
        await user.save()

        const contact = create_sample_contact(user, users[0].contact)
        const res = await contact.save()

        expect(res.changes).toBe(1)
    })

    test('get user\'s contact', async () => {
        const user = await User.get(users[0].id)
        const res = await user.contact

        expect(res.id).toBe(users[0].contact.id)
        expect(res.email).toBe(users[0].contact.email)
        expect(res.phone).toBe(users[0].contact.phone)
    })

    test('remove contact from db', async () => {
        const user = await User.get(users[0].id)
        const contact = await user.contact
        const res = await contact.remove()

        expect(res.changes).toBe(1)

        const rem_cont = await user.contact

        expect(rem_cont).toBeUndefined()

        user.remove()
    })
})