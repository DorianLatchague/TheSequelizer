const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const passport = require("./config/passport");
const PORT = process.env.PORT || 5000;
const db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("views"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keeping it secret, keeping it safe", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/authentication.js")(app);
require("./routes/sequelizer.js")(app);

app.use(bodyParser.json())
//app.use(express.static(__dirname + '/public'));


// Syncing our database and logging a message to the user upon success
db.sequelize.sync();
app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
});