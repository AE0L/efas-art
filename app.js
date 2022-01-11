/** Node.js Server Appilcation
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import google_util from './google'
import body_parser from 'body-parser'
import cookie_parser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import sqliteStoreFactory from 'express-session-sqlite'
import helmet from 'helmet'
import path from 'path'
import * as sqlite3 from 'sqlite3'
import router from './routes'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { google } from 'googleapis'
import { inspect } from 'util'
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
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}))
const sqlite_store = sqliteStoreFactory(session)
app.use(session({
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