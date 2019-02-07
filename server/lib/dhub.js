'use strict';

var config = require( './config.js' ).current;
var knex = require( 'knex' );
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dhub' );

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

