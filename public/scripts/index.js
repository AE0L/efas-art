$(document).ready(() => {
    $('#signup-form').submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        const fd = new FormData(this)

        if (fd.get('password') === fd.get('re-password')) {
            const user_len = toString(fd.get('username')).length
            const pass_len = toString(fd.get('password')).length
            const user_is_valid = user_len >= 4
            const pass_is_valid = pass_len >= 8 && pass_len <= 20

            if (!user_is_valid) {
                // TODO show username warning
            }

            if (!pass_is_valid) {
                // TODO show password warning
            }

            if (user_is_valid && pass_is_valid) {
                console.log('test')
                $.ajax({
                    type: 'POST',
                    data: $(this).serialize(),
                    cache: false,
                    url: 'register',
                    success: (data) => {
                        console.log('post success', data)
                        // TODO redirect to home page
                    },
                    error: (err) => {
                        console.log('post fail', err)
                        // TODO register failed
                    }
                })
            }
        } else {
            // TODO passwords do not match
        }
    })
})