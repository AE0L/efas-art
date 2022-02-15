/*Log-in Validation*/
function login_form_validate() {
    validate_input(
        login_user,
        loginuser_feedback,
        'Please enter your username',
        login_user.value.length < 4,
        'Invalid username length'
    )

    const pass_len = login_pass.value.length

    validate_input(
        login_pass,
        loginpass_feedback,
        'Please enter your password',
        !(pass_len >= 8 && pass_len <= 20),
        "Invalid password length"
    )
}

$(document).ready(() => {
    $('#login-form').submit(function(e) {
        login_form_validate()
        e.preventDefault()
        e.stopPropagation()

        login_modal_button.disabled = true
        login_modal_button.innerText = 'Loading...'

        if (this.checkValidity() === false) {
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: 'login',
                success: (data) => {
                    if (data.success) {
                        window.location.pathname = '/'
                    } else {
                        login_modal_button.disabled = false
                        login_modal_button.innerText = 'Log in'

                        if (data.param === 'username') {
                            set_validity(login_user, loginuser_feedback, data.msg)
                        } else if (data.param === 'password') {
                            set_validity(login_pass, loginpass_feedback, data.msg)
                        }
                    }
                },
                error: (err) => {
                    console.error('post fail', err)
                }
            })
        }
    })
})