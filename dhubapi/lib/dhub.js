'use strict';

var config = require( './config.js' ).current;
var knex = require( 'knex' );
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dhub' );

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

module.exports = dhubknex;

