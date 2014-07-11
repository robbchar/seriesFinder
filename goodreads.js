'use strict';
var express = require('express'),
    app = express(),
    util = require('util'),
    querystring = require('querystring'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    xml2jsParser = require('xml2js').Parser(),

    https = require('https'),

    mongo = require('mongodb'),
    monk = require('monk'),
    db = monk('localhost:27017/goodreads'),
    // is the nodeOnly argument passed in
    nodeOnly = (process.argv.indexOf('nodeOnly') > -1),
    // app info, configguration data
    appInfo = require('./appInfo.json'), // this includes the keys for good reads and the host and the port for the server
    GRapi = require('./goodReadsFunctions.js')(appInfo, https, xml2jsParser); // good reads api functions;
    
function addUser(user, callback) {
    console.log('addUser');
    var collection = db.get('users');
    // Submit to the DB
    collection.update({
        "GRprofileId": user.profile.id
    }, user, {
        "upsert": true
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        callback(null, user);
    });
}

function getUser(id, callback) {
    console.log('getUser');
    var collection = db.get('users');
    // must find user by id
    collection.find({
        GRprofileId: id.toString()
    }, {
        limit: 1
    }, function(e, user) {
        callback(user);
    });
}
// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(session({
    secret: "skjghskdjfhbqigohqdiouk",
    saveUninitialized: true,
    resave: true
}));

app.use(express.static(__dirname + '/app'));
app.listen(appInfo.port, appInfo.host);
util.log('Listening at ' + appInfo.host + ':' + appInfo.port);
// allow CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    next();
});
// Handlers
// Home Page
app.get('/', function(req, res) {
    util.log('index page');
    res.redirect('index.html');
});

app.get('/isLoggedIn', GRapi.IsLoggedIn);
app.get('/userInfo', GRapi.GetUserInfo);
app.get('/shelfInfo', GRapi.ShelfInfo);
app.get('/bookInfo', GRapi.BookInfo);
app.get('/seriesInfo', GRapi.SeriesInfo);
app.get('/getSeriesToFinish', GRapi.GetSeriesToFinish);