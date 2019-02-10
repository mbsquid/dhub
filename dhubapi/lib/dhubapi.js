"use strict"
/* *******************************************************************************
dhubapi.js

Main dhubapi node+express application.

Sets up everything for the app to run.  Primary goal is to setup the handling of HTTP
requests.
** *******************************************************************************/

// Setup logging for node server - need to set getLogger for other mods to use
var serverlogger = require( './logger-server.js' );
var commonlogger = require( '../../common/lib/logger.js' );
commonlogger.getLogger = serverlogger.getLogger;
var mylog = commonlogger.getLogger( 'dhubapi-app' );

// Get standard express modules - sessions, URL parsing, HTTPS services, filesystems, etc
var express = require( 'express' );
var session = require( 'express-session' );
var createError = require( 'http-errors' );
var path = require('path');
var https = require('https');
var fs = require('fs');
// MBS comment out for now - will want to store sessions once have user logins
// var knexSessionStore = require( 'connect-session-knex' )(session); // will need this when store session info in DB

// Get constants & config for our application
const Constants = require( './constants.js' );
var config = require( './config.js' ).current;


// Get express
var app = express();


// setup SSL - MBS need better for production environment
mylog.debug('Creating HTTPS server ' + httpsPort + '...');
var httpsPort = process.env.PORT || config.httpPort,
  ssloptions = {
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.crt'),
  };
https.createServer( ssloptions, app ).listen( httpsPort, function(err) {
  // If we were called as a child process, let our parent know we are ready.
  if(process.send) process.send('ready');
});



// view engine setup - not serving any pages/templates now
//app.set('views', __dirname + '/../views/' );
//app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Make the 'public' directory public - put js/css/images/etc there - MBS don't need yet
//app.use(express.static(path.join(__dirname, '/../../public')));


// main router
mylog.debug('Setting up routes ...');
// Module for handling api calls to dhub
var dbapi = require( '../routes/dbapi.js' );
app.use( Constants.API.rootPath, dbapi);







// If we get here, we requested something we didn't expect
// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
// Log errors to user and/or log depending on environment configuration
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  // Provide stack trace based on config.debug
  res.locals.error = config.debug.errStackToResp ? err : {};
  if( config.debug.errStackToLog ) mylog.debug( err );

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// share and go
module.exports = app;

