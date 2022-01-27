const { google } = require('googleapis')
const moment = require('moment')
const { User } = require('../../models/user')
const WatermarkCollection = require('../../models/watermark_collection')
const { users, wtms, create_sample_gallery, create_sample_user } = require('../samples');

let test_user = null
let test_col = null

function create_wtm_collection(gallery, wtm_col) {
    return new WatermarkCollection(
        gallery,
        wtm_col.name,
        wtm_col.description,
        moment().toLocaleString(),
        wtm_col.id,
        wtm_col.col_dir
    )
}

test('watermark collection model constructor', () => {
    const user = create_sample_user(users[2])
    const gallery = create_sample_gallery(user, users[2].gallery)
    const wtm_col = create_wtm_collection(gallery, wtms[0])

    expect(wtm_col.id).toBe(wtms[0].id)
    expect(wtm_col.gallery.id).toBe(gallery.id)
    expect(wtm_col.name).toBe(wtms[0].name)
    expect(wtm_col.description).toBe(wtms[0].description)
})

test('save watermark collection to db', async () => {
    test_user = create_sample_user(users[2])
    await test_user.hash_pass()
    await test_user.gen_root_dir()
    await test_user.save()

    const gallery = create_sample_gallery(test_user, users[2].gallery)
    await gallery.gen_art_col_dir()
    await gallery.gen_watermark_col_dir()
    await gallery.save()

    test_col = create_wtm_collection(gallery, wtms[0])
    const res = await test_col.save()

    expect(res.changes).toBe(1)
})

test('get watermark collection from db', async () => {
    const wtm_col = await WatermarkCollection.get(test_col.id)

    expect(wtm_col.id).toBe(test_col.id)
    expect(wtm_col.name).toBe(test_col.name)
    expect(wtm_col.description).toBe(test_col.description)
    expect(wtm_col.col_dir).toBe(test_col.col_dir)
})

test('delete watermark collection from db', async () => {
    const wtm_col = await WatermarkCollection.get(test_col.id)
    const res = await wtm_col.remove()

    expect(res.changes).toBe(1)

    const rem_col = await WatermarkCollection.get(test_col.id)

    expect(rem_col).toBeUndefined()
})

test('create & remove watermark collection\'s gdrive directory', async () => {
    const drive = google.drive({ version: 'v3', auth: global.gauth })
    const user = await User.get(test_user.id)
    const gallery = await user.gallery
    const wtm_col = create_wtm_collection(gallery, wtms[0])

    await wtm_col.gen_col_dir()

    const col_res = await drive.files.get({
        fileId: wtm_col.col_dir,
        fields: 'id, name'
    })

    expect(col_res.data.id).toBe(wtm_col.col_dir)
    expect(col_res.data.name).toBe(wtm_col.id)

    const rem_col = await wtm_col.remove_dir()

    expect(rem_col.data).toBe('')

    await user.remove_dir()
    await user.remove()
})