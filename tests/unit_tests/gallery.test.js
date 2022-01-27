const { google } = require('googleapis')
const Gallery = require('../../models/gallery')
const { User } = require('../../models/user')
const { users, create_sample_user, create_sample_gallery } = require('../samples')

let test_user = null
let test_gal = null

test('gallery model constructor', () => {
    const user = create_sample_user(users[1], true)
    const { gallery } = users[1]
    const gal = create_sample_gallery(user, gallery, true)

    expect(gal.id).toBe(gallery.id)
    expect(gal.user.id).toBe(user.id)
    expect(gal.art_col_dir).toBe(gallery.art_col_dir)
    expect(gal.watermark_col_dir).toBe(gallery.watermark_col_dir)
})

test('save gallery model to db', async () => {
    test_user = create_sample_user(users[1])
    const { gallery } = users[1]
    test_gal = create_sample_gallery(test_user, gallery)

    await test_user.hash_pass()
    await test_user.gen_root_dir()
    await test_user.save()

    const res = await test_gal.save()

    expect(res.changes).toBe(1)
})

test('get user\'s gallery', async () => {
    const user = await User.get(test_user.id)
    const gal = await user.gallery

    expect(gal.id).toBe(test_gal.id)
    expect(gal.user.id).toBe(user.id)
    expect(gal.art_col_dir).toBe(test_gal.art_col_dir)
    expect(gal.watermark_col_dir).toBe(test_gal.watermark_col_dir)
})

test('get gallery by id', async () => {
    const gal = await Gallery.get(test_gal.id)

    expect(gal.id).toBe(test_gal.id)
    expect(gal.user.id).toBe(test_user.id)
    expect(gal.art_col_dir).toBe(test_gal.art_col_dir)
    expect(gal.watermark_col_dir).toBe(test_gal.watermark_col_dir)
})

test('remove gallery from db', async () => {
    const user = await User.get(test_user.id)

    await user.remove_dir()
    await user.remove()

    const rem_gal = await Gallery.get(test_gal.id)

    expect(rem_gal).toBeUndefined()
})

test('create & remove art/watermark collection gdrive directory', async () => {
    const drive = google.drive({ version: 'v3', auth: global.gauth })
    const user = create_sample_user(users[1])
    await user.hash_pass()
    await user.gen_root_dir()
    await user.save()

    const { gallery } = users[1]
    const gal = create_sample_gallery(user, gallery)

    await gal.gen_art_col_dir()

    const art_res = await drive.files.get({
        fileId: gal.art_col_dir,
        fields: 'id, name'
    })

    expect(art_res.data.id).toBe(gal.art_col_dir)
    expect(art_res.data.name).toBe('ART_COLLECTIONS')

    await gal.gen_watermark_col_dir()

    const wat_res = await drive.files.get({
        fileId: gal.watermark_col_dir,
        fields: 'id, name'
    })

    expect(wat_res.data.id).toBe(gal.watermark_col_dir)
    expect(wat_res.data.name).toBe('WATERMARK_COLLECTIONS')

    const rem_art = await gal.remove_art_col_dir()
    const rem_wat = await gal.remove_watermark_col_dir()

    expect(rem_art.data).toBe('')
    expect(rem_wat.data).toBe('')

    user.remove_dir()
    user.remove()
})

