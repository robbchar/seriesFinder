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
	methodOverride = require('method-override'),
	passport = require('passport'),
	GoodreadsStrategy = require('passport-goodreads').Strategy,

	https = require('https'),

	mongo = require('mongodb'),
	MongoStore = require('connect-mongo')(session), // for storing the session in mongodb
	monk = require('monk'),
	db = monk('localhost:27017/goodreads'),
	users = db.get('users'),
	// is the nodeOnly argument passed in
	nodeOnly = (process.argv.indexOf('nodeOnly') > -1),
	// app info, configguration data
	appInfo = require('./appInfo.json'), // this includes the keys for good reads and the host and the port for the server
	GRapi = require('./goodReadsFunctions.js')(appInfo, https, xml2jsParser); // good reads api functions
	// grOAuth = require('./grOAuth.js')(appInfo, db, app, passport); // gr oauth library
	
function addUser(user, callback) {
	console.log('addUser');
	// Submit to the DB
	users.update({
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
	// must find user by id
	users.find({
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

app.use(methodOverride());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	cookie : {
		maxAge: 3600000 // see below
	},
    secret: "skjghskdjfhbqigohqdiouk",
    // saveUninitialized: true,
    // resave: true,
    store: new MongoStore({
	    db: 'goodreads',
	    host: '127.0.0.1',
	    port: 27017
	  })
}));
// app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());
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


// app.get('/login', GRapi.Login);
// app.get('/processCallBack', GRapi.ProcessCallBack);
app.get('/isLoggedIn', GRapi.IsLoggedIn);
app.get('/userInfo', GRapi.GetUserInfo);
app.get('/shelfInfo', GRapi.ShelfInfo);
app.get('/bookInfo', GRapi.BookInfo);
app.get('/seriesInfo', GRapi.SeriesInfo);
app.get('/getSeriesToFinish', GRapi.GetSeriesToFinish);





// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Goodreads profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
	users.insert({ user: user }, function (err, doc) {
		if (err) throw err;
		done(null, user);
	});
});

passport.deserializeUser(function(obj, done) {
	obj = users.findOne({ "user.id": obj.id }).on('success', function (doc) {
		GRapi.SetUser(doc);
		done(null, doc);
	});
});


// Use the GoodreadsStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Goodreads profile), and
//   invoke a callback with a user object.
passport.use(new GoodreadsStrategy({
	consumerKey: appInfo.key,
	consumerSecret: appInfo.secret,
	callbackURL: "http://127.0.0.1:3000/auth/goodreads/callback"
  },
  function(token, tokenSecret, profile, done) {
	// asynchronous verification, for effect...
	process.nextTick(function () {
	  
	  // To keep the example simple, the user's Goodreads profile is returned to
	  // represent the logged-in user.  In a typical application, you would want
	  // to associate the Goodreads account with a user record in your database,
	  // and return that user instead.
	  return done(null, profile);
	});
  }
));


// app.get('/isAuthenticated',
// 	ensureAuthenticated,
// 	function(res, req){
// 		req.send(user);
// 	});

// GET /auth/goodreads
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Goodreads authentication will involve redirecting
//   the user to goodreads.com.  After authorization, Goodreads will redirect the user
//   back to this application at /auth/goodreads/callback
app.get('/auth/goodreads',
passport.authenticate('goodreads'),
function(req, res){
  console.log('/auth/goodreads');
  // The request will be redirected to Goodreads for authentication, so this
  // function will not be called.
});

// GET /auth/goodreads/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/goodreads/callback', 
passport.authenticate('goodreads', { failureRedirect: '/login' }),
function(req, res) {
	console.log('/auth/goodreads/callback');
	console.log('user: ' +JSON.stringify(req.user));
	res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	console.log('ensureAuthenticated');
	console.log('req.session: ' +JSON.stringify(req.session));
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/auth/goodreads')
}

// function authenticate(){
// 	console.log('authenticate');
// 	passport.authenticate('goodreads');
// }