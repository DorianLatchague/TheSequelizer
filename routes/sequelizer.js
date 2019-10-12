const path = require('path');
const db = require("../models");

var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
    app.get("/", (req, res) => {
        if (req.user) {
            res.sendFile(path.resolve(__dirname,"../views/dashboard.html"));
        }
        else {
            res.sendFile(path.resolve(__dirname,"../views/login.html"));
        }
    })
    app.get("/sequelizer/:id", isAuthenticated, (req, res) => {
        res.sendFile(path.resolve(__dirname,"../views/sequelizer.html"));
    })
    app.get("/api/sequelize/:id", isAuthenticated, (req,res) => {
        db.version.findOne({
            where: {
                id: parseInt(req.params.id)
            },
            include : [{
                model: db.model,
                include: [db.field,db.association]
            },db.project]
          }).then(data => {
              console.log(data);
              if (!data) {
                res.json({error: "Not Found"});
              }
              else if (data.project.userId === req.user.id) {
                console.log(data) | res.json(data);
              }
              else {
                res.json({error: "Unauthorized"});
              }
            })
        .catch(err => console.log(err) | res.json(err))
    })
    app.post("/api/new", (req,res) =>{
        console.log(req.body);
        db.project.create({
            userId: req.user.id,
            name: req.body.name,
            versions: [{}]
        },{include: [db.version]}).then((data) => {
            console.log(data)
            res.json({redirect:"/sequelizer/"+data.versions[0].dataValues.id});
        }).catch(err => console.log(err) | res.json(err));
    })
    app.get("/api/sequelize", isAuthenticated, (req,res) => {
        db.user.findOne({
            where: req.user,
            include : [{
                model: db.project,
                include:[{
                    model:db.version,
                    include: [{  
                        model: db.model,
                        include: [db.association,db.field]
                    }]
                }]
            }]
          }).then(data => console.log(data) | res.json(data))
        .catch(err => console.log(err) | res.json(err))
    })
    app.post("/api/sequelize/:id", isAuthenticated, (req, res) => {
        let validating = [];
            let version = {
                projectId: req.params.id,
                models: []
            } 
            for (let key in req.body) {
                let newModel = {}
                newModel.associations = [];
                newModel.fields = [];
                if (key !== "Sequelize Index") {
                    if (req.body[key].associations) {
                        for (let association of req.body[key].associations) {
                            newModel.associations.push({associate: association});
                        }
                    }
                    for (let field in req.body[key].fields) {
                        newModel.fields.push(req.body[key].fields[field])
                    }
                }
                newModel.name = key;
                version.models.push(newModel);
            }
            db.version.create(version, {
                include: [{
                    model: db.model,
                    include: [ db.association, db.field ]
                }]
            })
            for (let key in req.body) {
                if (key !== "Sequelize Index") {
                console.log(req.body[key]);
                    let file =
`module.exports = function(sequelize, DataTypes) {
    var ${key} = sequelize.define("${key}", {`
                        for (let i = 0; i < req.body[key].fields.length; i++) {
                            file +=
`       
        ${req.body[key].fields[i].field}: {
            type: DataTypes.${req.body[key].fields[i].type}`
                            if (req.body[key].fields[i].allowNull === 'true') {
                                file += `,
            allowNull: true`
                            }
                            else {
                                file += `,
            allowNull: false`
                            }
                            if (i === req.body[key]["fields"].length - 1) {
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
                    if (req.body[key]["associations"]) {
                        file += `       
    ${key}.associate = function(models) {`
                        for (let i = 0; i < req.body[key]["associations"].length; i++) {
                            file += `
        ${key}.hasOne(models.${req.body[key]["associations"][i]});`
                        }
                    file += `
    }`          
                    }
                    file +=
    `   
    return ${key};
};`
                    req.body[key] = file;
                            }
                        }
            let index =
                            `'use strict';
        
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
        req.body["Sequelize Index"] = index;
        res.json(req.body);
    });
}