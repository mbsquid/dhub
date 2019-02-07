'use strict';

var logger = require( '../../common/lib/logger' );
var debug = require( 'debug' );

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




