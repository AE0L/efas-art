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

    validate_input(email, email_feedback, 'Please input your email')
    validate_input(firstname, firstname_feedback, 'Please input your first name')
    validate_input(lastname, lastname_feedback, 'Please input your last name')
}


$(document).ready(() => {
    $('#signup-form').submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        if (this.checkValidity() === false) {
            signup_form_validate()
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: 'register',
                success: (data) => {
                    if (data.success) {
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