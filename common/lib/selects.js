'use strict';

var constants = require( './constants.js' );



/************************************************************************

Define select options
*/

var Selects = {
  YN: {
    UNSPECIFIED: { label: constants.UNKNOWN, value: constants.UNKNOWN },
    YES: { label: 'Yes', value: 'y' },
    NO: { label: 'No', value: 'n' },
  },
  YNBOOLEAN : {
    UNSPECIFIED: { label: constants.UNKNOWN, value: null },
    YES: { label: 'Yes', value: true },
    NO: { label: 'No', value: false },
  },
  GENDER: {
    UNSPECIFIED: { label: constants.UNKNOWN, value: constants.UNKNOWN },
    MALE: { label: 'Male', value: 'Male' },
    FEMALE: { label: 'Female', value: 'Female' },
    UNKNOWN: { label: 'Unknown', value: 'Unknown' },
  },
  LANGUAGE: {
    // MBS NEED MORE LANGUAGES
    UNSPECIFIED: { label: constants.UNKNOWN, value: constants.UNKNOWN },
    ENGLISH: { label: 'English', value: 'English' },
    SPANISH: { label: 'Spanish', value: 'Spanish' },
    FRENCH: { label: 'French', value: 'French' },
    SWAHILI: { label: 'Swahili', value: 'Swahili' },
    PIGLATIN: { label: 'igPay atinLay', value: 'PigLatin' },
  },
  US_TIMEZONE_NAMES: {
    AMERICA_UNSPECIFIED: { label: constants.UNKNOWN, value: constants.UNKNOWN },
    AMERICA_ADAK: { label: 'America/Adak', value: 'America/Adak' },
    AMERICA_ANCHORAGE: { label: 'America/Anchorage', value: 'America/Anchorage' },
    AMERICA_BOISE: { label: 'America/Boise', value: 'America/Boise' },
    AMERICA_CHICAGO: { label: 'America/Chicago', value: 'America/Chicago'  },
    AMERICA_DENVER: { label: 'America/Denver', value: 'America/Denver' },
    AMERICA_DETROIT: { label: 'America/Detroit', value: 'America/Detroit' },
    AMERICA_LOS_ANGELES: { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
    AMERICA_NEW_YORK: { label: 'America/New_York', value: 'America/New_York' },
    AMERICA_PHOENIX: { label: 'America/Phoenix', value: 'America/Phoenix' },
  },
};

module.exports = Selects;

