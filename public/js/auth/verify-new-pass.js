function verify_form_validate() {
    validate_input(
        con_verify_pass,
        con_verify_pass_feedback,
        'Please confirm your password',
        (con_verify_pass.value !== verify_pass.value),
        'Passwords do not match'
    )

    const verify_pass_len = verify_pass.value.length

    validate_input(
        verify_pass,
        verify_pass_feedback,
        'Please input a secure password',
        !(verify_pass_len >= 8 && verify_pass_len <= 20),
        'Invalid password length'
    )
}

$(document).ready(() => {
    $('#new-pass-form').submit(function(e) {
        verify_form_validate()
        e.preventDefault()
        e.stopPropagation()

        new_pass_modal_button.disabled = true
        new_pass_modal_button.innerText = 'Loading...'

        if (this.checkValidity() === false) {
            this.classList.add('was-validated')
        } else {
            $.ajax({
                type: 'POST',
                data: $(this).serialize(),
                cache: false,
                url: `/verify-new-password?uid=${this.dataset.uid}`,
                success: (data) => {
                    new_pass_modal_button.disabled = false
                    new_pass_modal_button.innerText = 'Update password'

                    if (data.success) {
                        alert('Password was successfully changed, please login to continue')
                        window.location.href = `${window.location.origin}/`
                    }
                },
                error: (err) => {
                    console.error('post fail', err)
                }
            })
        }
    })
})