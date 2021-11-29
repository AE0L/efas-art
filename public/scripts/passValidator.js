$(document).ready(function() {
    //Tried input,change, keypress (up, down) event listener
    $('#password, #conpassword').on("change", function(){

    alert("kamote");
    var newPasswordValue = $("#password").val();
    var confirmPasswordValue = $("#conpassword").val();

    if (newPasswordValue.length > 0 && confirmPasswordValue.length > 0) {
      if (confirmPasswordValue !== newPasswordValue) {
        $("#password-does-not-match-text").removeAttr("hidden");
        $("#logbutton").attr("disabled", true);
      }
      if (confirmPasswordValue === newPasswordValue) {
        $("#logbutton").removeAttr("disabled");
        $("#password-does-not-match-text").attr("hidden", true);
      }
    }
    });

    //Tried Jquery Validation Plug-in
    $( "password" ).validate({
      rules: {
        password: "required",
        conpassword: {
          equalTo: "#password"
        },

        message: {
          conpassword: "Passwords do not match"
        }
      }
    });
});

