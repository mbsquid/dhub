"use strict"



// Some requires for processing requets
var express = require( 'express' );
var session = require( 'express-session' );
// var knexSessionStore = require( 'connect-session-knex' )(session); // will need this when store session info in DB
var createError = require( 'http-errors' );
var path = require('path');
var https = require('https');
var fs = require('fs');
const Constants = require( './constants.js' );
// Get config
var config = require( './config.js' ).current;




// Setup logging for node server
var serverlogger = require( './logger-server.js' );
var commonlogger = require( '../../common/lib/logger.js' );
commonlogger.getLogger = serverlogger.getLogger;
var mylog = commonlogger.getLogger( 'app' );

var knexdhub = require( './dhub.js' );

var dbapi = require( '../routes/dbapi.js' );


// Get express
var app = express();


// setup SSL - need better for production environment
var httpsPort = process.env.PORT || config.httpPort,
  ssloptions = {
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.crt'),
  };
mylog.debug('Creating HTTPS server ' + httpsPort + '...');
https.createServer( ssloptions, app ).listen( httpsPort, function(err) {
  // If we were called as a child process, let our parent know we are ready.
  if(process.send) process.send('ready');
});



//




// view engine setup
app.set('views', __dirname + '/../views/' );
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Make the 'public' directory public - put js/css/images/etc there
app.use(express.static(path.join(__dirname, '/../../public')));


// main router
mylog.debug('Setting up routes ...');
app.use( Constants.API.rootPath, dbapi);







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  // Provide stack trace based on config.debug
  res.locals.error = config.debug.errStackToResp ? err : {};
  if( config.debug.errStackToLog ) mylog.debug( err );

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
