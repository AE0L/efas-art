const { google } = require('googleapis')
const moment = require('moment')
const { User } = require('../../models/user')
const ArtCollection = require('../../models/art_collection')
const {
    users,
    arts,
    create_sample_gallery,
    create_sample_user,
    create_art_collection
} = require('../samples')

describe('ArtCollection unit test', () => {

    let test_user = null
    let test_col = null

    test('art collection model constructor', () => {
        const user = create_sample_user(users[2])
        const gallery = create_sample_gallery(user, users[2].gallery)
        const art_col = create_art_collection(gallery, arts[0])

        expect(art_col.id).toBe(arts[0].id)
        expect(art_col.gallery.id).toBe(gallery.id)
        expect(art_col.name).toBe(arts[0].name)
        expect(art_col.description).toBe(arts[0].description)
    })

    test('save art collection to db', async () => {
        test_user = create_sample_user(users[2])
        await test_user.hash_pass()
        await test_user.gen_root_dir()
        await test_user.save()

        const gallery = create_sample_gallery(test_user, users[2].gallery)
        await gallery.gen_art_col_dir()
        await gallery.gen_watermark_col_dir()
        await gallery.save()

        test_col = create_art_collection(gallery, arts[0])
        const res = await test_col.save()

        expect(res.changes).toBe(1)
    })

    test('get art collection from db', async () => {
        const art_col = await ArtCollection.get(test_col.id)

        expect(art_col.id).toBe(test_col.id)
        expect(art_col.name).toBe(test_col.name)
        expect(art_col.description).toBe(test_col.description)
        expect(art_col.col_dir).toBe(test_col.col_dir)
    })

    test(`gets all user's art collections`, async () => {
        const user = await User.get(test_user.id)
        const gallery = await user.gallery
        const art_cols = await gallery.art_collections

        expect(art_cols.length).toBe(1)
        expect(art_cols[0].id).toBe(test_col.id)
        expect(art_cols[0].name).toBe(test_col.name)
        expect(art_cols[0].description).toBe(test_col.description)
        expect(art_cols[0].col_dir).toBe(test_col.col_dir)
    })

    test('delete art collection from db', async () => {
        const art_col = await ArtCollection.get(test_col.id)
        const res = await art_col.remove()

        expect(res.changes).toBe(1)

        const rem_col = await ArtCollection.get(test_col.id)

        expect(rem_col).toBeUndefined()
    })

    test('create & remove art collection\'s gdrive directory', async () => {
        const drive = google.drive({ version: 'v3', auth: global.gauth })
        const user = await User.get(test_user.id)
        const gallery = await user.gallery
        const art_col = create_art_collection(gallery, arts[0])

        await art_col.gen_col_dir()

        const col_res = await drive.files.get({
            fileId: art_col.col_dir,
            fields: 'id, name'
        })

        expect(col_res.data.id).toBe(art_col.col_dir)
        expect(col_res.data.name).toBe(art_col.id)

        const rem_col = await art_col.remove_dir()

        expect(rem_col.data).toBe('')

        await user.remove_dir()
        await user.remove()
    })

})