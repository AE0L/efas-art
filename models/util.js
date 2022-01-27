const db = require('./db')

const random_id = () => {
    return `${Math.floor(100000 + Math.random() * 900000)}`
}

module.exports = {
    random_id: random_id
}