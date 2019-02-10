'use strict';
/* *******************************************************************************
config.js

Defines configuration parameters based on the environment.

Only current enviornment is development, but will add more (production, test, etc).
** *******************************************************************************/

var Environments = {
  development: {
    label: 'Development',
    httpPort: 3001, // for http listening
    debug: {
      errStackToLog: true,
      errStackToResp: true,
    },

    // database config
    dhubknex: {
      client: 'mssql',
      connection: {
        host: '10.204.76.78',           // Can override with environment variable DHUB_IP
        user: 'Donald',                 // Can override with environment variable DB_USER
        password: 'INSERT_DB_PASSWORD', // Shouldn't really store credentials in file but allowing it for now - override with DHUB_PW
        database: 'DHUB',               // Can override with environment variavle DHUB_DB
        options: { encrypt: true },
      },
      pool: {
        min: 2,
        max: 4,
      },
    },
  },
  // add prod, test, etc

};



// Default current environment to 'development' if none provide via NODE_ENV
var currentEnvironment = process.env.NODE_ENV || 'development' ;
Environments.current = Environments [ currentEnvironment ];


// export away
module.exports = Environments;

