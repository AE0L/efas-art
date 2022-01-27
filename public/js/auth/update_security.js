function security_form_validate() {
    validate_input(cur_pass, cur_pass_feed, 'Please enter your current password')

    const new_pass_len = new_pass.length

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
            if (data.success) {
                window.location.pathname = '/profile/settings?s=sec'
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
            console.log('post fail', err)
        }
    })
}

$(document).ready(() => {
    $('#security_form').onsubmit = function(e) {
        e.prevenDefault()
        e.stopPropagation()

        if (this.checkValidity() === false) {
            security_form_validate()
            this.classList.add('was-validated')
        } else {
            post_form(this)
        }
    }
})