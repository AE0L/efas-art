$(document).ready(() => {
    $('#forgot-pass-form').submit(function(e) {
        login_form_validate()
        e.preventDefault()
        e.stopPropagation()

        forgot_pass_modal_button.disabled = true
        forgot_pass_modal_button.innerText = 'Loading...'

        if (this.checkValidity() === false) {
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: '/forgot-password',
                success: (data) => {
                    forgot_pass_modal_button.disabled = true
                    forgot_pass_modal_button.innerText = 'Loading...'

                    if (data.success) {
                        alert('Verification e-mail was sent, please check your inbox')
                        window.location.pathname = '/'
                    }
                },
                error: (err) => {
                    console.error('post fail', err)
                }
            })
        }
    })
})