
'use strict';


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
        host: '10.204.76.78',
        user: 'Donald',
        password: 'XLinfoadmin@123', // MBS shouldn't store credentials in standard github file, but ok for now
        database: 'DHUB',
        options: { encrypt: true, debug: { data: true, packet: true } },
      },
      pool: {
        min: 2,
        max: 4,
      },
    },
  },
  // add prod, test, etc

};


var currentEnvironment = process.env.NODE_ENV || 'development' ;
Environments.current = Environments [ currentEnvironment ];

module.exports = Environments;




