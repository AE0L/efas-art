/*Input Validation*/
const validate_input = (input, feed, missing_msg, cond = null, msg = null) => {
    const state = input.validity

    if (state.valueMissing) {
        input.setCustomValidity(missing_msg)
    } else if (cond != null && cond) {
        input.setCustomValidity(msg)
    } else {
        input.setCustomValidity('')
    }

    feed.innerText = input.validationMessage
}

const set_validity = (input, feed, msg) => {
    input.setCustomValidity(msg)
    input.classList.add('is-invalid')
    feed.innerText = input.validationMessage
}

const invalidate = (input, feed) => {
    input.setCustomValidity('')
    input.classList.remove('is-invalid')
    feed.innerText = ''
}
