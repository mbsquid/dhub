'use strict';

/************************************************************************

Some constants
*/

var Constants = {
  UNKNOWN: '-',
  DateFormats: {
    FORMAT_MDY: 'MM/DD/YYYY',
    FORMAT_YMD: 'YYYY-MM-DD',
    FORMAT_MDYHMA: 'M/D/YYYY@h:mm a',
    FORMAT_dMDYHMA: 'ddd, M/D/YYYY@h:mm a',
    FORMAT_dHMA: 'ddd @ h:mm a',
    FORMAT_dMD: 'ddd M/D',
    //FORMAT_YMDHMSMZ: undefined, // use default format
    FORMAT_YMDHMSMZ: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
  },
  API: {
    rootPath: '/api',
    defaultLimit: 25,
    defaultOffset: 0,
    defaultOrderby: { column:'Id', order: 'DESC' },
  },
};

module.exports = Constants;

