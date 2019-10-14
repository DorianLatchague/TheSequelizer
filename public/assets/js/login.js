$(() => {
    $("#register-ctn").hide();
    $("#login").click(() => {
        $.ajax({
            type: "POST",
            url: "/api/login",
            data: {
                email: $("#email").val().trim(),
                password: $("#password").val().trim()
            }
        }).then(() => {
            window.location.reload();
        }).catch(err => console.log(err))
    })
    $("#register").click(() => {
        $.ajax({
            type: "POST",
            url: "/api/register",
            data: {
                email: $("#email2").val().trim(),
                password: $("#password2").val().trim()
            }
        }).then(() => {
            window.location.reload();
        }).catch(err => console.log(err))
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