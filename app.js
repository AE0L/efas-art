/** Node.js Server Appilcation
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import fs from 'fs'
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

/* routes */
app.use('/', router)

// app.get('/test/google', (req, res) => {
//     const auth = google_util.authorize(require('./efas-art-api-8115a4968f02.json'))

//     google_util.access_drive(auth, google_util.list_files, `'1HKa_hOx92NxpObCACEYIk0I6F-qAZ-6k' in parents`)

//     return res.send({ result: 'test' })
// })

/* 404 page */
app.use((req, res, next) => {
    res.status(400)

    if (req.accepts('html')) {
        return res.render('404', { url: req.url })
    }

    res.type('txt').send('not found')
})

/* google drive api */
global.gauth = google_util.authorize(require('./efas-art-api-8115a4968f02.json'))

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})

global.__basedir = __dirname