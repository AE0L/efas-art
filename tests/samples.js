const moment = require('moment')
const { User } = require('../models/user')
const Contact = require('../models/contacts')
const Gallery = require('../models/gallery')
const Watermark = require('../models/watermark')
const WatermarkCollection = require('../models/watermark_collection')
const Artwork = require('../models/artwork')
const ArtCollection = require('../models/art_collection')

const users = [
    {
        id: '000000',
        first_name: 'John',
        last_name: 'Doe',
        username: 'john_doe',
        password: 'johndoe2022',
        root_dir: '000001',
        salt: '$2b$10$uan8/UoTuDuaZ78rhYfPee',
        contact: {
            id: '000001',
            email: 'john_doe@gmail.com',
            phone: '09901234123'
        },
        gallery: {
            id: '000001',
            art_col_dir: '000001',
            watermark_col_dir: '0000001'
        }
    },
    {
        id: '000001',
        first_name: 'John',
        last_name: 'Smith',
        username: 'john_smith',
        password: 'johnsmith2022',
        root_dir: '000002',
        salt: '$2b$10$uan8/UoTuDuaZ78rhYfPef',
        contact: {
            id: '000002',
            email: 'john_smith@gmail.com',
            phone: '09904321321'
        },
        gallery: {
            id: '000002',
            art_col_dir: '000002',
            watermark_col_dir: '0000002'
        }
    },
    {
        id: '000002',
        first_name: 'Mark',
        last_name: 'Snow',
        username: 'mark_snow',
        password: 'marksnow2022',
        root_dir: '000003',
        salt: '$2b$10$uan8/UoTuDuaZ78rhYfPeg',
        contact: {
            id: '000003',
            email: 'mark_snow@gmail.com',
            phone: '09901423132'
        },
        gallery: {
            id: '000003',
            art_col_dir: '000003',
            watermark_col_dir: '0000003'
        }
    }
]

const arts = [{
    id: '000001',
    name: 'art collection #1',
    description: 'collection of artworks',
    col_dir: '0000001',
    artworks: [{
        id: '000001',
        name: 'test artwork #1',
        description: 'test artwork',
        tags: 'test, art, wrk',
        document: '000001'
    }]
}]

const wtms = [
    {
        id: '000001',
        name: 'watermark collection #1',
        description: 'signature watermarks',
        col_dir: '0000001',
        watermarks: [{
            id: '000001',
            name: 'test watermark',
            document: '0000001'
        }]
    }
]

function create_sample_user(user, use_id = false) {
    return new User(
        user.first_name,
        user.last_name,
        user.username,
        user.password,
        use_id ? user.id : null,
        user.root_dir
    )
}

function create_sample_contact(user, contact) {
    return new Contact(
        user,
        contact.email,
        contact.phone,
        contact.id
    )
}

function create_sample_gallery(user, gallery, use_id = false) {
    return new Gallery(
        user,
        use_id ? gallery.id : null,
        gallery.art_col_dir,
        gallery.watermark_col_dir
    )
}

function create_art_collection(gallery, art_col) {
    return new ArtCollection(
        gallery,
        art_col.name,
        art_col.description,
        moment().toLocaleString(),
        art_col.id,
        art_col.col_dir
    )
}

const create_artwork = (col, art) => {
    return new Artwork(
        col,
        art.name,
        art.tags,
        art.description,
        moment().toLocaleString(),
        art.id,
        art.document
    )
}

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

const create_watermark = (col, wtm) => {
    return new Watermark(
        col,
        wtm.name,
        moment().toLocaleString(),
        wtm.id,
        wtm.document
    )
}

module.exports = {
    users: users,
    arts: arts,
    wtms: wtms,
    create_sample_user: create_sample_user,
    create_sample_contact: create_sample_contact,
    create_sample_gallery: create_sample_gallery,
    create_art_collection: create_art_collection,
    create_artwork: create_artwork,
    create_wtm_collection: create_wtm_collection,
    create_watermark: create_watermark
}