function security_form_validate() {
    validate_input(cur_pass, cur_pass_feed, 'Please enter your current password')

    const new_pass_len = new_pass.value.length

    validate_input(
        new_pass,
        new_pass_feed,
        'Please input a secure password',
        !(new_pass_len >= 8 && new_pass_len <= 20),
        'Invalid password length'
    )

    validate_input(
        re_new_pass,
        re_new_pass_feed,
        'Please confirm your password',
        (re_new_pass.value !== new_pass.value),
        'Passwords do not match'
    )
}

const post_form = (form) => {
    $.ajax({
        type: 'POST',
        data: $(form).serialize(),
        cache: false,
        url: '/profile/settings/edit/security',
        success: (data) => {
            $(security_save_changes_button).prop('disabled', true)
            $(security_save_changes_button).prop('innerText', 'Save changes')

            if (data.success) {
                window.location.href = '/profile/settings?s=sec'
            } else {
                for (let error of data.errors) {
                    if (error.param === 'cur_pass') {
                        set_validity(cur_pass, cur_pass_feed, error.msg)
                    } else if (error.param === 'new_pass') {
                        set_validity(new_pass, new_pass_feed, error.msg)
                    }
                }
            }
        },
        error: (err) => {
            console.error('post fail', err)
        }
    })
}

$(security_form).submit(function(e) {
    security_form_validate()

    e.preventDefault()
    e.stopPropagation()

    $(security_save_changes_button).prop('disabled', true)
    $(security_save_changes_button).prop('innerText', 'Loading...')

    if (this.checkValidity() === false) {
        this.classList.add('was-validated')
    } else {
        post_form(this)
    }
})