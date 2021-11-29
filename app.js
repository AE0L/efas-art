/** Node.js Server Appilcation
 * 
 * @author Carl Justin Jimenez
 * @author Joseph Tupaen
 * @author Meryll Cornita
 * @author Paula Millorin
 */
import body_parser from 'body-parser'
import cookie_parser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import sqliteStoreFactory from 'express-session-sqlite'
import helmet from 'helmet'
import path from 'path'
import * as sqlite3 from 'sqlite3'
const app = express()

/* template engine */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))

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
app.use('/', require('./routes'))

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})

global.__basedir = __dirname