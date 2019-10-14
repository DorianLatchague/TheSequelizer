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
        // let validating = [];
        //     let version = {
        //         projectId: req.params.id,
        //         models: []
        //     } 
        //     for (let key in req.body) {
        //         let newModel = {}
        //         newModel.associations = [];
        //         newModel.fields = [];
        //         if (key !== "Sequelize Index") {
        //             if (req.body[key].associations) {
        //                 for (let association of req.body[key].associations) {
        //                     newModel.associations.push({associate: association});
        //                 }
        //             }
        //             for (let field in req.body[key].fields) {
        //                 newModel.fields.push(req.body[key].fields[field])
        //             }
        //         }
        //         newModel.name = key;
        //         version.models.push(newModel);
        //     }
        db.version.create(req.body, {
            include: [{
                model: db.model,
                include: [ db.association, db.field ]
            }]
        }).then(data => console.log(data) | res.json(data))
        .catch(err => console.log(err) | res.json(err))
    })
}