'use strict';

/************************************************************************

For logging:

mylog = require('logger.js').getLogger('moduleName');

Four error levels:
mylog.debug( STUFF );
mylog.info( STUFF );
mylog.warn( STUFF );
mylog.error( STUFF );

In browser, map this to console.  In other things, we'll map it to other things (whatever they may be).
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

// Can change this to file logging or other in future
// Different logging strategies for server vs browser
exports.getLogger = undefined;

