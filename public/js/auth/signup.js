/*Sign-up Validation*/
function signup_form_validate() {
    validate_input(
        conpassword,
        conpassword_feedback,
        'Please confirm your password',
        (conpassword.value !== mainpass.value),
        'Passwords do not match'
    )

    const mainpass_len = mainpass.value.length

    validate_input(
        mainpass,
        mainpass_feedback,
        'Please input a secure password',
        !(mainpass_len >= 8 && mainpass_len <= 20),
        'Invalid password length'
    )

    const user_len = username.value.length

    validate_input(
        username,
        username_feedback,
        'Please input a unique username',
        (user_len < 4),
        'Invalid username length'
    )

    validate_input(_email, email_feedback, 'Please input your email')
    validate_input(firstname, firstname_feedback, 'Please input your first name')
    validate_input(lastname, lastname_feedback, 'Please input your last name')
}

const post_form = (form) => {
    $.ajax({
        type: 'POST',
        data: $(form).serialize(),
        cache: false,
        url: 'register',
        success: (data) => {
            if (data.success) {
                window.location.pathname = '/'
            } else {
                sign_up_modal_button.disabled = false
                sign_up_modal_button.innerText = 'Sign up'

                for (let error of data.errors) {
                    if (error.param === 'email') {
                        set_validity(_email, email_feedback, error.msg)
                    } else if (error.param === 'username') {
                        set_validity(username, username_feedback, error.msg)
                    }
                }
            }
        },
        error: (err) => {
            console.error('post fail', err)
        }
    })
}

$(document).ready(() => {
    $('#signup-form').submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        sign_up_modal_button.disabled = true
        sign_up_modal_button.innerText = 'Loading...'

        if (this.checkValidity() === false) {
            signup_form_validate()
            this.classList.add('was-validated')
        } else {
            post_form(this)
        }
    })
})
