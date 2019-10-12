$(() => {
    $("#register-ctn").hide();
    $("#login").click(() => {
        $.ajax({
            type: "POST",
            url: "/api/login",
            // contentType: "json",
            data: {
                email: $("#email").val().trim(),
                password: $("#password").val().trim()
            }
        }).then(() => {
            window.location.reload();
        })
    })
    $("#register").click(() => {
        $.ajax({
            type: "POST",
            url: "/api/register",
            // contentType: "json",
            data: {
                email: $("#email2").val().trim(),
                password: $("#password2").val().trim()
            }
        })
    })
    $("#register-link").click(() => {
        $("#register-ctn").show();
        $("#login-ctn").hide();
    })
    $("#login-link").click(() => {
        $("#login-ctn").show();
        $("#register-ctn").hide();
    })
})