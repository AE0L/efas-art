/** Node.js Server Appilcation
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const sqliteStoreFactory = require('express-session-sqlite').default
const helmet = require('helmet')
const path = require('path')
const sqlite3 = require('sqlite3')
const swaggerJSDoc  = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { google } = require('googleapis')
const { inspect } = require('util')

const google_util = require('./google')
const router = require('./routes')
const app = express()

/* swagger */
const swagger_defs = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for EFAS-ART',
        version: '1.0.0'
    }
}
const swagger_opts = { definition: swagger_defs, apis: ['./routes/**/*.js'] }
const swagger_spec = swaggerJSDoc(swagger_opts)

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swagger_spec))

/* template engine */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

/* middlewares */
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: true }))
app.use(cookie_parser())

/* session handler */
const sqlite_store = sqliteStoreFactory(session)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new sqlite_store({
        driver: sqlite3.Database,
        path: './models/efas_art.db',
        ttl: 604800000
    })
}))

/* google drive api */
global.gauth = google_util.authorize(require('./efas-art-api-8115a4968f02.json'))

/* routes */
app.use('/', router)

app.get('/test/google', async (req, res) => {
    const auth = global.gauth
    const drive = google.drive({ version: 'v3', auth })

    drive.files.list({
        fields: 'files(name, id, parents)'
    }, (err, r) => {
        r.data.files.forEach(file => {
            console.log(inspect(file))
        })
    })

    res.send('done')
})

app.get('/test/delete', async (req, res) => {
    const gd = google.drive({ version: 'v3', auth: global.gauth })
    const id = '1xUlUB2KaLiHTeQ0MI54MucyJlnuGdm9p'

    gd.files.delete({
        fileId: id,
    }, (err, r) => {
        if (err) return console.log(err)

        console.log('deleted:', id)
    })

    res.send('done')
})

/* 404 page */
app.use((req, res, next) => {
    res.status(400)

    if (req.accepts('html')) {
        return res.render('404', { url: req.url })
    }

    res.type('txt').send('not found')
})

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})

global.__basedir = __dirname
