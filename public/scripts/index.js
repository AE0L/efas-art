$(document).ready(() => {
    $('#signup-form').submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        const fd = new FormData(this)
        if (fd.get('password') === fd.get('re-password')) {
            const user_len = toString(fd.get('username')).length
            const pass_len = toString(fd.get('password')).length
            const user_is_valid = user_len >= 4
            const pass_is_valid = pass_len >= 8 && pass_len <= 20

            $("#logbutton").removeAttr("disabled");
            $("#password-does-not-match-text").attr("hidden", true);

            if (!user_is_valid) {
                // TODO show username warning
            }

            if (!pass_is_valid) {
                // TODO show password warning
            }

            if (user_is_valid && pass_is_valid) {
                console.log('test')
                $.ajax({
                    type: 'POST',
                    data: $(this).serialize(),
                    cache: false,
                    url: 'register',
                    success: (data) => {
                        console.log('post success', data)
                        // TODO redirect to home page
                    },
                    error: (err) => {
                        console.log('post fail', err)
                        // TODO register failed
                    }
                })
            }
        } else {
            $("#password-does-not-match-text").removeAttr("hidden");

            //--------------TRY MANUAL CSS COLOR CHANGE
            // $("password").css("border-color", "Red")
            
            //--------------TRY FROM BOOTSTRAP V5.0
            // 'use strict'

            // // Fetch all the forms we want to apply custom Bootstrap validation styles to
            // var forms = document.querySelectorAll('.form-control pass-valid')
          
            // // Loop over them and prevent submission
            // Array.prototype.slice.call(forms)
            //   .forEach(function (form) {
            //     form.addEventListener('submit', function (event) {
            //       if (!form.checkValidity()) {
            //         event.preventDefault()
            //         event.stopPropagation()
            //       }
          
            //       form.classList.add('was-validated')
            //     }, false)
            //   })


        }
    })     
});


