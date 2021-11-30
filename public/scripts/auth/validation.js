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