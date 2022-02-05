$(document).ready(() => {
    $('#forgot-pass-form').submit(function(e) {
        login_form_validate()
        e.preventDefault()
        e.stopPropagation()

        if (this.checkValidity() === false) {
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: '/forgot-password',
                success: (data) => {
                    if (data.success) {
                        alert('Verification e-mail was sent, please check your inbox')
                        window.location.pathname = '/'
                    }
                },
                error: (err) => {
                    console.log('post fail', err)
                }
            })
        }
    })
})
