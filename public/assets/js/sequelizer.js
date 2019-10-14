let tableCount = 0;
let fieldCount = [];
let associationCount = [];
$(() => {
    function fetchId(str) {
        let arr = [];
        let i = str.length - 1;
        while (str[i] !== "/") {
            arr.push(str[i])
            i--;
        }
        arr.reverse();
        return arr.join("");
    }
    $.ajax({
        type: "GET",
        url: "/api/sequelize/" + fetchId(window.location.href)
    }).then(data => {
        let index = `'use strict';
        
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

if (config.use_env_variable) {
    var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;`

function fileRender(model) {
    let file =
`module.exports = function(sequelize, DataTypes) {
    var ${model.name} = sequelize.define("${model.name}", {`
    for (let i = 0; i < model.fields.length; i++) {
        file +=
`       
        ${model.fields[i].field}: {
            type: DataTypes.${model.fields[i].type}`
        if (model.fields[i].allowNull === 'true') {
            file += `,
            allowNull: true`
        }
        else {
            file += `,
            allowNull: false`
        }
        if (i === model.fields.length - 1) {
                file += `
        }`      
        }   
        else {
                file += `
        },` 
        }
    }
    file += `
    });`
    if (model.associations.length) {
        file += `       
    ${model.name}.associate = function(models) {`
        for (let i = 0; i < model.associations.length; i++) {
            file += `
        ${model.name}.hasOne(models.${model.associations[i].associate});`
        }
    file += `
    }`          
    }
    file +=
`   
    return ${model.name};
};`
    return file
}
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
                removeAssociationEventListeners();
                addAssociationListener();
            })
        }
        if ("error" in data) {
            window.location = "/";
        }
        addTableListener();
        addFieldListener();
        addAssociationListener();
        // Sequelize Listener
        $("#submit-tables").click(function () {
            $("#code").html(null);
            let tables = {
                models: []
            };
            for (let i = 0; i < fieldCount.length; i++) {
                let model = {
                    name: $(`#name${i}`).val().trim(),
                    associations: [],
                    fields: []
                };
                for (let j = 1; j < fieldCount[i] + 1; j++) {
                    model.fields.push({ field: $(`#field${i}-${j}`).val().trim(), type: $(`#fieldtype${i}-${j}`).val().trim(), allowNull: $(`#allownull${i}-${j}`).prop("checked") == true });
                }
                for (let j = 0; j < associationCount[i]; j++) {
                    model.associations.push({ associate: $(`#name${parseInt($(`#association${i}-${j}`).val()) - 1}`).val() });
                }
                tables.models.push(model)
            }
            $.ajax({
                type: "POST",
                url: "/api/sequelize/" + data.project.id,
                data: tables
            }).then(
                data => {
                    $("#code").html(null);
                    $("#code").append($("<code>").text("index.js:\n\n\n"+index));
                    for (let model of data.models) {
                        $("#code").append($("<code>").text(model.name + ".js:\n\n\n" + fileRender(model)));
                    }
                })
                .catch(err => console.log(err));
        })
        // Download Listener
        $("#download").click(() => {
            $("#code").html(null);
            let tables = {
                models: []
            };
            for (let i = 0; i < fieldCount.length; i++) {
                let model = {
                    name: $(`#name${i}`).val().trim(),
                    associations: [],
                    fields: []
                };
                for (let j = 1; j < fieldCount[i] + 1; j++) {
                    model.fields.push({ field: $(`#field${i}-${j}`).val().trim(), type: $(`#fieldtype${i}-${j}`).val().trim(), allowNull: $(`#allownull${i}-${j}`).prop("checked") == true });
                }
                for (let j = 0; j < associationCount[i]; j++) {
                    model.associations.push({ associate: $(`#name${parseInt($(`#association${i}-${j}`).val()) - 1}`).val() });
                }
                tables.models.push(model)
            }
            $.ajax({
                type: "POST",
                url: "/api/sequelize/" + data.project.id,
                data: tables
            }).then(data => {
                $("#code").html(null);
                $("#code").append($("<code>").text("index.js:\n\n\n"+index));
                for (let model of data.models) {
                    $("#code").append($("<code>").text(model.name + ".js:\n\n\n" + fileRender(model)));
                }
                let zip = new JSZip()
                let folder = zip.folder("models");
                folder.file("index.js", index);
                for (let model of tables.models) {
                    folder.file(model.name + ".js", fileRender(model));
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
        if (data.models.length) {
            for (let i = 0; i < data.models.length; i++) {
                $("#add-table").click();
            }
            for (let [index,value] of data.models.entries()) {
                $(`#name${index}`).val(value.name)
                for (let j = 1; j < value.fields.length + 1; j++) {
                    $(`#name${index}`).parent().parent().children(".add-field").click();
                    $(`#field${index}-${j}`).val(value.fields[j-1].field);
                    $(`#fieldtype${index}-${j}`).val(value.fields[j-1].type);
                    $(`#allownull${index}-${j}`).prop( "checked", value.fields[j-1].allowNull )
                }
                for (let j = 0; j < value.associations.length; j++) {
                    $(`#name${index}`).parent().parent().children(".add-association").click();
                    for (let z = 0; z < data.models.length; z++) {
                        if ($(`#name${z}`).val() === value.associations[j].associate) {
                            $(`#association${z}-${j}`).val(z+1);
                            break;
                        }
                    }
                }
            }
            $("#code").append($("<code>").text("index.js:\n\n\n"+index));
            for (let model of data.models) {
                $("#code").append($("<code>").text(model.name + ".js:\n\n\n" + fileRender(model)));
            }
        } else {
            $("#add-table").click();
        }
    }).catch(err => console.log(err));
})