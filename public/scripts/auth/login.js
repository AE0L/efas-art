function login_form_validate() {
    validate_input(login_user, loginuser_feedback, 'Please enter your username')
    validate_input(login_pass, loginpass_feedback, 'Please enter your password')
}

$(document).ready(() => {
    $('#login-form').submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        if (this.checkValidity() === false) {
            login_form_validate()
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: 'login',
                success: (data) => {
                    if (data.success) {
                        window.location.pathname = '/timeline'
                    } else {
                        console.log(data)
                    }
                },
                error: (err) => {
                    console.log('post fail', err)
                }
            })
        }
    })
})