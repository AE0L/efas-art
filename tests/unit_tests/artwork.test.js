const moment = require('moment')
const Artwork = require("../../models/artwork")
const {
    create_sample_user,
    users,
    arts,
    create_art_collection,
    create_artwork,
    create_sample_gallery
} = require("../samples")

describe('Artwork unit test', () => {

    let tmp_user = null
    let tmp_gal = null
    let tmp_col = null
    let tmp_art = null

    beforeAll(async () => {
        tmp_user = create_sample_user(users[0])

        await tmp_user.hash_pass()
        await tmp_user.gen_root_dir()
        await tmp_user.save()

        tmp_gal = create_sample_gallery(tmp_user, users[0].gallery)

        await tmp_gal.gen_art_col_dir()
        await tmp_gal.gen_watermark_col_dir()
        await tmp_gal.save()

        tmp_col = create_art_collection(tmp_gal, arts[0])

        await tmp_col.save()
    })

    afterAll(() => {
        tmp_user.remove_dir()
        tmp_user.remove()
    })

    test('artwork model constructor', () => {
        const art = create_artwork(tmp_col, arts[0].artworks[0])

        const { id, name, tags, description, document } = arts[0].artworks[0]

        expect(art.art_col.id).toBe(tmp_col.id)
        expect(art.id).toBe(id)
        expect(art.name).toBe(name)
        expect(art.description).toBe(description)
        expect(art.tags).toBe(tags)
        expect(art.document).toBe(document)
    })

    test('save artwork to db', async () => {
        tmp_art = create_artwork(tmp_col, arts[0].artworks[0])

        const res = await tmp_art.save()

        expect(res.changes).toBe(1)
    })

    test('get artwork from db', async () => {
        const art = await Artwork.get(tmp_art.id)

        expect(art.id).toBe(tmp_art.id)
        expect(art.name).toBe(tmp_art.name)
        expect(art.description).toBe(tmp_art.description)
        expect(art.tags).toBe(tmp_art.tags)
        expect(art.document).toBe(tmp_art.document)
    })

    test('remove artwork from db', async () => {
        const res = await tmp_art.remove()

        expect(res.changes).toBe(1)

        const rem_art = await Artwork.get(tmp_art.id)

        expect(rem_art).toBeUndefined()
    })

})