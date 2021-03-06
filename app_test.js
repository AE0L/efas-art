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
const swaggerJSDoc = require('swagger-jsdoc')
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
// app.use(body_parser.urlencoded({ extended: true }))
app.use(cookie_parser())

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
global.gauth = google_util.authorize(require('./efas-art-api-8115a4968f02.json'), false)

/* routes */
app.use('/', router)

/* 404 page */
app.use((req, res, next) => {
    res.status(400)

    if (req.accepts('html')) {
        return res.render('404', { url: req.url })
    }

    res.type('txt').send('not found')
})

module.exports = app