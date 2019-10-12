
let currentFiles;
let tableCount = 0;
let fieldCount = [];
let associationCount = [];
$(() => {
    function fetchId(str) {
        console.log(str);
        let arr = [];
        let i = str.length - 1;
        while (str[i] !== "/") {
            arr.push(str[i])
            i--;
        }
        console.log(arr);
        arr.reverse();
        return arr.join("");
    }
    $.ajax({
        type: "GET",
        url: "/api/sequelize/" + fetchId(window.location.href)
    }).then(data => {
        function removeFieldEventListeners() {
            $(".add-field").unbind();
        }
        function removeAssociationEventListeners() {
            $(".add-association").unbind();
        }
        function addTableListener() {
            $("#add-table").click(function () {
                $("#table-container").append($("<div>").addClass("table-card").data("tablecount", tableCount).append($("<div>").addClass("field-container").append($("<label>").attr("for", `name${tableCount}`).text(`Table ${tableCount + 1} Name:`)).append($("<input>").attr("name", `name${tableCount}`).attr("id", `name${tableCount}`))).append($("<div>").addClass("association-container")).append($("<button>").addClass("add-field").text("Add a field")).append($("<button>").addClass("add-association").text("Add an association")));
                tableCount++;
                $(".association-select").append($("<option>").text(tableCount));
                associationCount.push(0);
                fieldCount.push(0);
                removeFieldEventListeners();
                removeAssociationEventListeners();
                addFieldListener();
                addAssociationListener();
            });
        }
        function addFieldListener() {
            $(".add-field").click(function () {
                let currentTable = parseInt($(this).parent().data("tablecount"))
                fieldCount[currentTable]++;
                let currentField = fieldCount[parseInt($(this).parent().data("tablecount"))];
                $(this).siblings(".field-container").append($("<label>").attr("for", `field${currentTable}-${currentField}`).text(`Field ${currentField}:`)).append($("<div>").addClass("field-input-ctn").append($("<input>").attr("name", `field${currentTable}-${currentField}`).attr("id", `field${currentTable}-${currentField}`).attr("name", `field${currentTable}-${currentField}`).attr("placeholder", "Field Name")).append($("<select>").attr("id", `fieldtype${currentTable}-${currentField}`).append($("<option>").text("STRING")).append($("<option>").text("TEXT")).append($("<option>").text("INTEGER")).append($("<option>").text("BIGINT")).append($("<option>").text("FLOAT")).append($("<option>").text("DOUBLE")).append($("<option>").text("DECIMAL")).append($("<option>").text("DATE")).append($("<option>").text("BOOLEAN")))).append($("<label>").attr("for", `allownull${currentTable}-${currentField}`).text("Allow Null?")).append($("<input>").attr("type", "checkbox").attr("id", `allownull${currentTable}-${currentField}`).attr("name", `allownull${currentTable}-${currentField}`));
                removeFieldEventListeners();
                addFieldListener();
            })
        }
        function addAssociationListener() {
            $(".add-association").click(function () {
                let currentTable = parseInt($(this).parent().data("tablecount"))
                let currentAssociation = associationCount[parseInt($(this).parent().data("tablecount"))];
                $(this).siblings(".association-container").append($("<label>").attr("for", `association${currentTable}-${currentAssociation}`).text(`Association ${currentAssociation + 1}:`)).append($("<select>").attr("name", `association${currentTable}-${currentAssociation}`).addClass("association-select").attr("id", `association${currentTable}-${currentAssociation}`));
                for (let i = 0; i < tableCount; i++) {
                    $(`#association${currentTable}-${currentAssociation}`).append($("<option>").text(i + 1));
                }
                associationCount[parseInt($(this).parent().data("tablecount"))] = currentAssociation + 1;
                console.log(associationCount);
                removeAssociationEventListeners();
                addAssociationListener();
            })
        }
        function addDownloadEventListener() {
            $("#download").click(() => {
                $("#code").html(null);
                let tables = {};
                for (let i = 0; i < fieldCount.length; i++) {
                    let table = $(`#name${i}`).val().trim();
                    if (table === "") {
                        return $("#code").html($("<code>").text(`Error (You must enter a Table Name)`));
                    }
                    if (Object.keys(tables).includes(table)) {
                        return $("#code").html($("<code>").text(`Error (Duplicate Table Name "${table}")`));
                    }
                    if (associationCount[i]) {
                        tables[table] = {
                            fields: [],
                            associations: [new Array(associationCount[i])]
                        };
                    }
                    else {
                        tables[table] = {
                            fields: [],
                            associations: []
                        };
                    }
                }
                for (let i = 0; i < fieldCount.length; i++) {
                    let table = $(`#name${i}`).val().trim();
                    for (let j = 1; j < fieldCount[i] + 1; j++) {
                        let field = $(`#field${i}-${j}`).val().trim();
                        if (field === "") {
                            return $("#code").html($("<code>").text(`Error (You must enter a Field Name)`));
                        }
                        for (let fields of tables[table].fields) {
                            if (field === fields.field) {
                                return $("#code").html($("<code>").text(`Error (Duplicate Field Name "${field}") in "${table}"`));
                            }
                        }
                        let fieldType = $(`#fieldtype${i}-${j}`).val().trim();
                        let allowNull = $(`#allownull${i}-${j}`).prop("checked") == true;
                        tables[table].fields[j - 1] = { field: field, type: fieldType, allowNull: allowNull };
                    }
                    for (let j = 0; j < associationCount[i]; j++) {
                        let association = parseInt($(`#association${i}-${j}`).val());
                        if (association == NaN) {
                            return $("#code").html($("<code>").text(`Error (Your association must point at a table number)`));
                        }
                        tables[table]["associations"][j] = $(`#name${association - 1}`).val();
                        // tables[$(`#name${association - 1}`).val()]["associations"].push(table);
                    }
                }
                $.ajax({
                    type: "POST",
                    // contentType: "application/json",
                    url: "/api/sequelize/" + data.project.id,
                    data: tables
                }).then(data => {
                    let zip = new JSZip()
                    let folder = zip.folder("models");
                    folder.file("index.js", currentFiles["Sequelize Index"]);
                    for (let key in currentFiles) {
                        if (key != "Sequelize Index") {
                            folder.file(key + ".js", currentFiles[key]);
                        }
                    }
                    zip.generateAsync({ type: "blob" })
                        .then(function (content) {
                            var link = document.createElement('a');
                            link.href = window.URL.createObjectURL(content);
                            var fileName = "models.zip";
                            link.download = fileName;
                            link.click();
                        })
                        .catch(err => console.log(err));
                }).catch(err => console.log(err));
            })
        }
        function submitTables() {
            $("#submit-tables").click(function () {
                $("#code").html(null);
                let tables = {};
                for (let i = 0; i < fieldCount.length; i++) {
                    let table = $(`#name${i}`).val().trim();
                    if (table === "") {
                        return $("#code").html($("<code>").text(`Error (You must enter a Table Name)`));
                    }
                    if (Object.keys(tables).includes(table)) {
                        return $("#code").html($("<code>").text(`Error (Duplicate Table Name "${table}")`));
                    }
                    if (associationCount[i]) {
                        tables[table] = {
                            fields: [],
                            associations: [new Array(associationCount[i])]
                        };
                    }
                    else {
                        tables[table] = {
                            fields: [],
                            associations: []
                        };
                    }
                }
                for (let i = 0; i < fieldCount.length; i++) {
                    let table = $(`#name${i}`).val().trim();
                    for (let j = 1; j < fieldCount[i] + 1; j++) {
                        let field = $(`#field${i}-${j}`).val().trim();
                        if (field === "") {
                            return $("#code").html($("<code>").text(`Error (You must enter a Field Name)`));
                        }
                        for (let fields of tables[table].fields) {
                            if (field === fields.field) {
                                return $("#code").html($("<code>").text(`Error (Duplicate Field Name "${field}") in "${table}"`));
                            }
                        }
                        let fieldType = $(`#fieldtype${i}-${j}`).val().trim();
                        let allowNull = $(`#allownull${i}-${j}`).prop("checked") == true;
                        tables[table]["fields"][j - 1] = { field: field, type: fieldType, allowNull: allowNull };
                    }
                    for (let j = 0; j < associationCount[i]; j++) {
                        let association = parseInt($(`#association${i}-${j}`).val());
                        if (association == NaN) {
                            return $("#code").html($("<code>").text(`Error (Your association must point at a table number)`));
                        }
                        tables[table]["associations"][j] = $(`#name${association - 1}`).val();
                        // tables[$(`#name${association - 1}`).val()]["associations"].push(table);
                    }
                }
                console.log(tables);
                $.ajax({
                    type: "POST",
                    // contentType: "application/json",
                    url: "/api/sequelize/" + data.project.id,
                    data: tables
                }).then(
                    data => {
                        if (!currentFiles) {
                            currentFiles = data;
                            $("#btn-container").append($("<button>").attr("id", "download").text("Download Models Folder"));
                            addDownloadEventListener();
                        }
                        else {
                            currentFiles = data;
                        }
                        $("#code").html(null);
                        $("#code").append($("<code>").text("index.js:\n\n\n" + data["Sequelize Index"]));
                        for (let key in data) {
                            if (key != "Sequelize Index") {
                                $("#code").append($("<code>").text(key + ".js:\n\n\n" + data[key]));
                            }
                        }
                    })
                    .catch(err => console.log(err));
            })
        }
        if ("error" in data) {
            window.location = "/";
        }
        else {
            addTableListener();
            addFieldListener();
            addAssociationListener();
            submitTables();
            console.log(JSON.stringify(data));
            if (data.models.length) {
                for (let i of data.models) {
                    $("#add-table").click();
                    $(`#name${tableCount - 1}`).val(i.name)
                    for (let j = 1; j < i.fields.length + 1; j++) {
                        $(`#name${tableCount - 1}`).parent().parent().children(".add-field").click();
                        $(`#field${tableCount - 1}-${j}`).val(i.fields[j-1].field);
                        $(`#fieldtype${tableCount - 1}-${j}`).val(i.fields[j-1].type);
                        $(`#allownull${tableCount - 1}-${j}`).prop( "checked", i.fields[j-1].allowNull )
                    }
                }
                newTableCount = 0;
                for (let i of data.models) {
                    for (let j = 0; j < i.associations.length; j++) {
                        $(`#name${newTableCount}`).parent().parent().children(".add-association").click();
                        for (let z = 0; z < tableCount; z++) {
                            if ($(`#name${z}`).val() === i.associations[j].associate) {
                                $(`#association${newTableCount}-${j}`).val(z+1);
                                break;
                            }
                        }
                    }
                    newTableCount ++;
                }
                $("#submit-tables").click();
            } else {
                $("#add-table").click();
            }
        }
    }).catch(err => console.log(err));
})