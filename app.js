const path = require('path')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const app = express()
const sqlite3 = require('sqlite3')
const sqlite_factory = require('express-session-sqlite')
// TODO store port elsewhere
const port = 8080

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(body_parser.json())
app.use(cookie_parser())
app.use('/', require('./routes'))

// TODO store secret elsewhere
app.use(session({ secret: 'efas-art-secret' }))
const sqlite_store = sqlite_factory(session)
app.use(session({
    store: new sqlite_store({
        driver: sqlite3.Database,
        path: './models/efas_art.db',
        ttl: 604800000
    })
}))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})