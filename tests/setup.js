const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const google_util = require('../google')

global.gauth = google_util.authorize(require('../efas-art-api-8115a4968f02.json'), false)