const path = require('path')
const express = require('express')
const app = express()
const port = 8080

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => res.sendFile('index'))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`)
})
