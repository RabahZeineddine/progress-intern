/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

var db;

var cloudant;

var dbCredentials = {
    dbName: 'progress-intern'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');



var cfenv = require('cfenv');
var fs = require('fs');
// load local VCAP configuration
var vcapLocal = null;
var appEnv = null;
var appEnvOpts = {};
var accountsDB;
//var conversationWorkspace, conversation;

fs.stat('./vcap-local.json', function (err, stat) {
    if (err && err.code === 'ENOENT') {
        // file does not exist
        console.log('No vcap-local.json');
        initializeAppEnv();
    }
    else if (err) {
        console.log('Error retrieving local vcap: ', err.code);
    }
    else {
        vcapLocal = require("./vcap-local.json");
        console.log("Loaded local VCAP", vcapLocal);
        appEnvOpts = {
            vcap: vcapLocal
        };
        initializeAppEnv();
    }
});
// get the app environment from Cloud Foundry, defaulting to local VCAP
function initializeAppEnv() {
    appEnv = cfenv.getAppEnv(appEnvOpts);
    if (appEnv.isLocal) {
        require('dotenv').load();
    }
    if (appEnv.services.cloudantNoSQLDB) {
                initCloudant(); 
    }
    else {
        console.error("No Cloudant service exists.");
    }
    if (appEnv.services.conversation) {
//        initConversation();
    }
    else {
        console.error("No Watson conversation service exists");
    }
}
// =====================================
// CLOUDANT SETUP ======================
// =====================================
//var cloudantURL = process.env.CLOUDANT_URL;

function initCloudant() {
    var cloudantURL = appEnv.services.cloudantNoSQLDB[0].credentials.url || appEnv.getServiceCreds("progress-intern").url;
    var Cloudant = require('cloudant')({
        url: cloudantURL
        , plugin: 'retry'
        , retryAttempts: 10
        , retryTimeout: 500
    });
    // Create the accounts db if it doesn't exist
    Cloudant.db.create(dbCredentials.dbName, function (err, body) {
        if (err) {
            console.log("Database already exists: ", dbCredentials.dbName);
        }
        else {
            console.log("New database created: ", dbCredentials.dbName);
        }
    });
    accountsDB = Cloudant.db.use(dbCredentials.dbName);
    
}


// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));



app.get('/', routes.index);
app.get('/register-admin',routes.registerAdmin);

app.post('/createAdminAccount',function(req,res){
    
});



http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
