$(()=> {
    function createCard(project) {
        let select = $("<select>").addClass("version-id");
        project.versions.reverse();
        for (let version of project.versions) {
            select.append($("<option>").text(`version ${version.id}`).attr("value",version.id))
        }
        $("#card-container").append($("<div>").addClass("model-card").append($("<h3>").text(`Project ${project.id}: ${project.name}`)).append(select).append($("<button>").addClass("version-btn").text("Open Version")));
    }
    $.ajax({
        type: "GET",
        url: "/api/sequelize"
    }).then(data => {
        $("#header").append($("<h3>").text(`Welcome ${data.email}! `).append($("<a>").text("Log out").attr("href","/logout")));
        data.projects.reverse();
        for (let i of data.projects) {
            createCard(i);
        }
        $(".version-btn").click(function() {
            window.location = "/sequelizer/"+$(this).siblings(".version-id").val();
        })
    }).catch(err => console.log(err));
    $("#new-project").click(() => {
        console.log($("#project-name").val().trim());
        $.ajax({
            type: "POST",
            url: "/api/new",
            data: {
                name: $("#project-name").val().trim()
            }
        }).then(data => {
            if ("redirect" in data) {
                window.location = data.redirect
            } 
        })
        .catch(err => console.log(err))
    })
})