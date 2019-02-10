'use strict';
/* ***************************************************************************
logger-server.js

Setup getLogger for node server application.
Use debug module for debug commands, and console for others
** ***************************************************************************/
var logger = require( '../../common/lib/logger.js' );
var debug = require( 'debug' );


// Define server getLogger
exports.getLogger = function( mod ) {
var logger = {
    // These just go directly to the console.
    info: console.info.bind(console),
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: debug( 'optum:' + mod + ':' ),
  };
  logger.debug.log = console.log.bind(console);
  return logger;
};




