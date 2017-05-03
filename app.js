/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var session = require('express-session');
var app = express();
var passwordHash = require('password-hash');

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
var db;
//var conversationWorkspace, conversation;

fs.stat('./vcap-local.json', function (err, stat) {
    if (err && err.code === 'ENOENT') {
        // file does not exist
        console.log('No vcap-local.json');
        initializeAppEnv();
    } else if (err) {
        console.log('Error retrieving local vcap: ', err.code);
    } else {
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
    } else {
        console.error("No Cloudant service exists.");
    }
    if (appEnv.services.conversation) {
        //        initConversation();
    } else {
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
        url: cloudantURL,
        plugin: 'retry',
        retryAttempts: 10,
        retryTimeout: 500
    });
    // Create the accounts db if it doesn't exist
    Cloudant.db.create(dbCredentials.dbName, function (err, body) {
        if (err) {
            console.log("Database already exists: ", dbCredentials.dbName);
        } else {
            console.log("New database created: ", dbCredentials.dbName);
        }
    });
    db = Cloudant.db.use(dbCredentials.dbName);
    initCloudantDocuments();

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

app.use(session({
    secret: 'ssshhhhh'
})); // Creates session


function initCloudantDocuments() {
    console.log('Cloudant documents are being checked...');
    db.get("authorizedAccounts", {
        revs_info: true
    }, function (err, doc) {
        if (!err) {
            console.log('Authorized accounts doc already exists!')
        } else {
            console.log('ttest');
            //Create document as it does not exist!
            if (err.statusCode == 404) {
                db.insert({
                    name: "Authorized accounts",
                    description: "Authorized w3-ids to be registered..",
                    accounts: [{
                        w3_id: "luciane@br.ibm.com",
                        userType: "manager"
                    }, {
                        w3_id: "rzeined@br.ibm.com",
                        userType: "intern"
                    }, {
                        w3_id: "ecury@br.ibm.com",
                        userType: "intern"
                    }]
                }, 'authorizedAccounts', function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Authorized accounts doc created!')
                    }
                })
            } else {
                console.log(err);
            }
        }
    });

    db.get('registeredAccounts', {
        revs_info: true
    }, function (err, doc) {
        if (!err) {
            console.log('Registered accounts doc already exists!');
        } else {
            if (err.statusCode == 404) {
                db.insert({
                    name: "Registered accounts",
                    description: "Accounts registered and able to sign in...",
                    accounts: {
                        manager: [],
                        monitor: [],
                        intern: []
                    }
                }, 'registeredAccounts', function (err, doc) {
                    if (err) console.log(err);
                    else console.log('Registered accounts doc created!')
                })
            }
        }
    });

    //Add all docs here.
    //.
    //.

}




app.get('/', routes.index);
app.get('/signup-admin', routes.signupAdmin);

app.get('/SignupError', routes.signupAdmin)


app.get('/api/checkW3ID', function (req, res) {
    console.log('Invoke w3-id verification ..');
    var data = {
        authorized: false,
        exists: false,
        w3_id: req.query.w3_id
    };
    if (validateEmail(data.w3_id)) {
        db.get("authorizedAccounts", {
            revs_info: true
        }, function (err, doc) {
            if (!err) {
                if (doc['accounts']) {

                    for (var account in doc['accounts']) {
                        if (data.w3_id.localeCompare(doc['accounts'][account]['w3_id']) == 0) {
                            data.authorized = true;
                            data.userType = doc['accounts'][account]['userType'];

                        }
                    }
                    if (!data.authorized) {
                        console.log('Unauthorized w3-id');
                        data.errorMsg = "Your W3-id isn't valid or authorized.";
                        res.end(JSON.stringify(data));
                    } else {
                        db.get("registeredAccounts", {
                            revs_info: true
                        }, function (err, doc) {
                            if (!err) {
                                if (doc['accounts']) {
                                    for (var acc in doc['accounts'][data.userType]) {
                                        if (data.w3_id.localeCompare(doc['accounts'][data.userType][acc]['w3_id']) == 0) {
                                            data.exists = true;
                                            data.errorMsg = "User already registered!";
                                            res.end(JSON.stringify(data));
                                        }
                                    }
                                    res.end(JSON.stringify(data));


                                } else {
                                    console.log(err);
                                    data.errorMsg = "An error occured! Try again later.";
                                    res.end(JSON.stringify(data));
                                }


                            } else {
                                console.log(err);
                                data.errorMsg = "An error occured! Try again later.";
                                res.end(JSON.stringify(data));
                            }
                        })
                    }

                } else {
                    console.log(err);
                    data.errorMsg = "An error occured! Try again later.";
                    res.end(JSON.stringify(data));
                }
            } else {
                console.log(err);
                data.errorMsg = "An error occured! Try again later.";
                res.end(JSON.stringify(data));
            }
        })
    } else {
        console.log('Invalid w3-id');
        data.errorMsg = "Your W3-id isn't valid or authorized.";
        res.end(JSON.stringify(data));
    }
});


app.get('/api/checkManagerID', function (req, res) {
    var id = req.query.id;
    var data = {
        authorized: false,
        error: false
    };
    console.log('Check manager id invoked..');
    db.get("registeredAccounts", {
        revs_info: true
    }, function (err, doc) {

        if (!err) {
            if (doc['accounts']) {
                for (var account in doc['accounts']['manager']) {
                    if (id == doc['accounts']['manager'][account]['manager_id']) {
                        data.authorized = true;
                        res.end(JSON.stringify(data));
                    }
                }
                data.error = true;
                data.errorMsg = "Manager id isn't valid! ask for another one.";
                res.end(JSON.stringify(data));
            } else {
                console.log('No account registered!');
                data.error = true;
                data.errorMsg = "An error occured! Try again later.";
                res.end(JSON.stringify(data));
            }
        } else {
            console.log(err);
            data.error = true;
            data.errorMsg = "An error occured! Try again later.";
            res.end(JSON.stringify(data));

        }
    })
});


app.post('/api/createAccount', function (req, res) {
    var user = req.body;
    user.firstname = user.firstname.substring(0, 1).toUpperCase() + user.firstname.substring(1).toLowerCase();
    user.lastname = user.lastname.substring(0, 1).toUpperCase() + user.lastname.substring(1).toLowerCase();

    user.password = passwordHash.generate(user.password);
    user.activities = [];
    var data = {};
    db.get("registeredAccounts", {
        revs_info: true
    }, function (err, doc) {
        if (!err) {

            if (!doc['accounts']) doc['accounts'] = {
                managers: [],
                monitors: [],
                interns: []
            };

            doc['accounts'][user.userType].push(user);
            db.insert(doc, doc.id, function (err, doc) {
                if (!err) {
                    console.log('User registered!');
                    user.welcomeMsg = user.firstname + ", welcome to intern progress!";
                    req.session.user = user;
                    data.status = "Registered";
                    data.error = false;
                    data.redirect = "/Home";
                    res.end(JSON.stringify(data));
                } else {
                    console.log(err);
                    data.status = "404";
                    data.error = true;
                    data.errorMsg = "An error occured! Try again later.";
                    res.end(JSON.stringify(data));
                }
            })

        } else {
            console.log(err);
            data.status = "404";
            data.error = true;
            data.errorMsg = "An error occured! Try again later.";
            res.end(JSON.stringify(data));
        }
    })

});


app.post('/login', function (req, res) {

    var user = {
        w3_id: req.body.w3_id,
        password: req.body.password
    };


    if (req.session.user != null && req.session.user != '') {
        res.redirect('/Home');
    } else {
        db.get("registeredAccounts", {
            revs_info: true
        }, function (err, doc) {
            if (!err) {

                if (doc['accounts']) {
                    var exists = false;
                    for (var type in doc['accounts']) {
                        for (var account in doc['accounts'][type]) {
                            if (user.w3_id.localeCompare(doc['accounts'][type][account]['w3_id']) == 0) {
                                exists = true;
                                if (passwordHash.verify(user.password, doc['accounts'][type][account]['password'])) {
                                    user = doc['accounts'][type][account];
                                    if (type == "manager") {

                                        //Get interns activities for the manager ..
                                        var interns = [];
                                        for (var intern in doc['accounts']['intern']) {

                                            if (doc['accounts']['intern'][intern]['manager_id'].localeCompare(user['manager_id']) == 0) {
                                                interns.push(doc['accounts']['intern'][intern]);
                                            }
                                        }
                                        user.interns = interns;
                                    }
                                    req.session.user = user;
                                    res.redirect('/Home');
                                } else {
                                    req.session.errorMsg = "Wrong credentials";
                                    res.redirect('/');
                                }
                            }
                        }
                    }
                    if (!exists) {
                        req.session.errorMsg = "Account not registered";
                        res.redirect('/');
                    }
                } else {
                    req.session.errorMsg = "An error occured! Try again later.";
                    res.redirect('/');
                }
            } else {
                req.session.errorMsg = "An error occured! Try again later.";
                res.redirect('/');
            }
        });
    }
});

app.get('/Home', function (req, res) {

    if (req.session.user != null && req.session.user != '') {
        if (req.session.user.userType == "intern") {
            res.render('intern-profile.html', {
                user: req.session.user
            });
        } else if (req.session.user.userType == "manager" || req.session.user.userType == "monitor") {
            //Get interns activities




            res.render('manager-profile.html', {
                user: req.session.user
            });
        }



    } else {
        req.session.errorMsg = "User not authenticated!";
        res.redirect('/');
    }

});




app.get('/api/getTimeline', function (req, res) {
    var data = {
        error: false
    };
    var activities = [];
    var user = req.session.user;
    if (user != null && user != '') {
        var groups = [];
        groups.push({
            id: 'all',
            content: 'All'
        });

        var items = [];

        console.log(JSON.stringify(user));
        for (var intern in user['interns']) {
            groups.push({
                id: user['interns'][intern]['w3_id'].split("@")[0],
                content: user['interns'][intern]['firstname']
            });
            //            user['interns'][intern]['group'] = user['interns'][intern]
        }
        console.log(JSON.stringify(groups));


    } else {
        data.error = true;
        console.log('An error occured on getting timeline info..');
        res.end(JSON.stringify(data));
    }
});



app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
})


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});
