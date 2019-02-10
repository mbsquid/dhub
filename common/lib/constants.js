'use strict';

/************************************************************************
Constants common across server and client apps.
*/

var Constants = {

  // General way to specify unknown or not-filled-out - Can be used in format for select/multi-select
  // for the not-yet-selected value (see selects.js)
  UNSPECIFIED: '-',

  // Date and datetime formats
  DateFormats: {
    FORMAT_MDY: 'MM/DD/YYYY',
    FORMAT_YMD: 'YYYY-MM-DD',
    FORMAT_MDYHMA: 'M/D/YYYY@h:mm a',
    FORMAT_dMDYHMA: 'ddd, M/D/YYYY@h:mm a',
    FORMAT_dHMA: 'ddd @ h:mm a',
    FORMAT_dMD: 'ddd M/D',
    FORMAT_YMDHMSMZ: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]', // default server format
  },

  // DHUB API parameters
  API: {
    rootPath: '/api',
    defaultLimit: 25,
    defaultOffset: 0,
    defaultOrderby: { column:'DHUB_Id__c', order: 'DESC' }, // by default, descending DHUB_Id__c (generally means last created are first)
  },

  // HTTP status codes for responses - 200 is the normal/good one
  HTTP_RESPONSE_STATUS: {
    OK: { status: 200 },
    BAD_REQUEST: { status: 400, message: 'Unable to understand request' },
    NOT_AUTHORIZED: { status: 401 },
    FORBIDDEN: { status: 403, },
    INTERNAL_SERVER_ERROR: { status: 500 },
  },

};

module.exports = Constants;

