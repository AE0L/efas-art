const { google } = require('googleapis')
const path = require('path')

const SCOPES = [process.env.G_SCOPE]
const ROOT_FOLDER = process.env.ROOT_FOLDER
const USER_FOLDER = process.env.USER_FOLDER

module.exports = {
    constants: {
        root: ROOT_FOLDER,
        user: USER_FOLDER,
        mime: {
            folder: 'application/vnd.google-apps.folder'
        }
    },


    authorize: (credentials, verbose = true) => {
        const jwt_client = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            SCOPES
        )

        jwt_client.authorize((err, token) => {
            if (err) {
                console.error(err)
            } else if (verbose) {
                console.log('auth success')
            }
        })

        return jwt_client
    },


    access_drive: (auth, action, ...args) => {
        const drive = google.drive({ version: 'v3', auth });
        action(drive, ...args)
    },

    upload_files: async (drive, files) => {
        return new Promise((resolve, reject) => {
            files.forEach((f) => {
                drive.files.create({
                    resource: f.metadata,
                    media: drive.media
                }, (err, res) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        console.log(`[GOOGLE] UPLOAD: ${res.data}`)
                        resolve(res.data)
                    }
                })
            })
        })
    },


    list_files: (drive, query = null) => {
        return new Promise((resolve, reject) => {
            drive.files.list({
                fields: 'files(id, name, parents)',
                q: query
            }, function(err, res) {
                if (err) {
                    console.error(err);
                    reject(err)
                } else {
                    resolve(res.data)
                }
            })
        })
    },


    delete_file: (drive, files) => {
        return new Promise((resolve, reject) => {
            let results = []
            files.forEach((f) => {
                drive.files.delete({
                    fileId: f.id,
                    supportsAllDrives: true,
                    fields: 'file(id, name)'
                }, (err, res) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        const res_str = `[GOOGLE] DELETE: ${res.data}`
                        console.log(res_str)
                        results.push(res_str)
                    }
                })
            })

            resolve(results)
        })
    }
}