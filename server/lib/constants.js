
'use strict';

/************************************************************************

Some constants
*/

var CommonConstants = require( '../../common/lib/constants.js' );
var _ = require( 'underscore' );

var ServerConstants = { server: {
  // constants for server - do we have any?
}}

var Constants = _.extend( {}, CommonConstants, ServerConstants );

module.exports = Constants;

