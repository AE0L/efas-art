const moment = require('moment')
const Watermark = require('../../models/watermark')
const {
    create_sample_user,
    users,
    create_wtm_collection,
    create_watermark,
    create_sample_gallery,
    wtms
} = require("../samples")

describe('Watermark unit test', () => {

    let tmp_user = null
    let tmp_gal = null
    let tmp_col = null
    let tmp_wtm = null

    beforeAll(async () => {
        tmp_user = create_sample_user(users[0])

        await tmp_user.hash_pass()
        await tmp_user.gen_root_dir()
        await tmp_user.save()

        tmp_gal = create_sample_gallery(tmp_user, users[0].gallery)

        await tmp_gal.gen_art_col_dir()
        await tmp_gal.gen_watermark_col_dir()
        await tmp_gal.save()

        tmp_col = create_wtm_collection(tmp_gal, wtms[0])

        await tmp_col.save()
    })

    afterAll(() => {
        tmp_user.remove_dir()
        tmp_user.remove()
    })

    test('watermark model constructor', () => {
        const wtm = create_watermark(tmp_col, wtms[0].watermarks[0])

        const { id, name, document } = wtms[0].watermarks[0]

        expect(wtm.watermark_col.id).toBe(tmp_col.id)
        expect(wtm.id).toBe(id)
        expect(wtm.name).toBe(name)
        expect(wtm.document).toBe(document)
    })

    test('save watermark to db', async () => {
        tmp_wtm = create_watermark(tmp_col, wtms[0].watermarks[0])

        const res = await tmp_wtm.save()

        expect(res.changes).toBe(1)

    })

    test('get watermark from db', async () => {
        const wtm = await Watermark.get(tmp_wtm.id)

        expect(wtm.id).toBe(tmp_wtm.id)
        expect(wtm.name).toBe(tmp_wtm.name)
        expect(wtm.document).toBe(tmp_wtm.document)
    })

    test('remove watermark from db', async () => {
        const res = await tmp_wtm.remove()

        expect(res.changes).toBe(1)

        const rem_wtm = await Watermark.get(tmp_wtm.id)

        expect(rem_wtm).toBeUndefined()
    })

})