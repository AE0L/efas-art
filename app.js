const path = require('path')
const express = require('express')
const app = express()
const port = 8080

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/base'))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})
