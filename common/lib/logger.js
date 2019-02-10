'use strict';

/************************************************************************

For logging.   Allows a common way to log when the code could be run on client and/or server.

General use is:
  var mylog = require( './logger.js' ).getLogger( 'moduleName' );

In this use example, messages in this module would be prefixed with the moduleName
for easy identification.

Supports four levels of logging:
mylog.debug( STUFF );
mylog.info( STUFF ); // (equivalent to mylog.log)
mylog.warn( STUFF );
mylog.error( STUFF );

In browser/client applciations, we can map this to console.

In other applications (server side, etc), we'll map it to other things (whatever they may be).
But first thing when your app starts, you'll want to set 'getLogger' for your application
that will return an appropriate logger for that app.
*/

exports.getLoggerForConsole = function(con) {
  return function(modName) {
    var prefix=modName + ":";
    return {
      debug: con.log.bind(con, prefix),
      log: con.log.bind(con, prefix),
      info: con.info.bind(con, prefix),
      warn: con.warn.bind(con, prefix),
      error: con.error.bind(con, prefix),
    };
  };
};

// Can change this to file logging or other in the future
exports.getLogger = undefined;

