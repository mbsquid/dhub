'use strict';
/* **************************************************************************
dhub.js

Returns knex module specific to dhub configuration - all modules accessing dhub
should use this so we have global connection pool
** **************************************************************************/

// Logging
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dhub' );

// Get current config for this environment
var config = require( './config.js' ).current;

// Get knex
var knex = require( 'knex' );

// Override with environment variables where given
config.dhubknex.connection.host = process.env.DHUB_IP || config.dhubknex.connection.host;
config.dhubknex.connection.user = process.env.DHUB_USER || config.dhubknex.connection.user;
config.dhubknex.connection.password = process.env.DHUB_PW || config.dhubknex.connection.password;
config.dhubknex.connection.database = process.env.DHUB_DB || config.dhubknex.connection.database;

// Create a connection pool for DHUB
var dhubknex = knex( config.dhubknex );


// Test database connection, and if error, don't start
dhubknex.select(knex.raw( '1 as TestOk' ))
  .then( function( resp ) {
    mylog.debug('database connected', resp );
  })
  .catch( function ( e ) {
    mylog.debug('Unable to connect to database, so exiting...', e );
    process.exit(1);
  });

// Share and run
module.exports = dhubknex;

