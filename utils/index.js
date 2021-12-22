export default {
    file_extension: function(filename) {
        var re = /(?:\.([^.]+))?$/

        return re.exec(filename)[1]
    },

    mime_type: function(extension) {
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg'
            case 'png':
                return 'image/png'
            case 'webp':
                return 'image/webp'
        }
    }
}