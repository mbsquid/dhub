
'use strict';

/************************************************************************
Access control & security
*/

var Constants = require( './constants.js' );
var dhubknex = require( './dhub.js' );
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'accesscontrol' );
var dhubknex = require( './dhub.js' );

// Update constants with new things if including this
var AccessControlConstants = {
  CRUDLevels: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
  },
  tokenKey: 'authToken',
};

var Profiles = {
  admin: {  // Have CRUD access to all records...
    Contact: { create: true, read: true, write: true, delete: true, },
    Account: { create: true, read: true, write: true, delete: true, },
    Contact_Method__c: { create: true, read: true, write: true, delete: true, },
    Membership__c: { create: true, read: true, write: true, delete: true, },
  },
  readonly: { // read access to all
    Contact: { read: true, },
    Account: { read: true, },
    Contact_Method__c: { read: true, },
    Membership__c: { read: true, },
  },
};

var authenticateUserByToken = function( req, res, next ) {
  var wheres = { 'MBS_User.ApiToken' : req.query[ AccessControlConstants.tokenKey ] } ;
  dhubknex( 'MBS_User' )
    .innerJoin('User', 'User.Dhub_Id__c', '=', 'MBS_User.UserDhubId')
    //.innerJoin('Profile', 'Profile.Id', '=', 'User.ProfileId')   // MBS WARNING DON"T HAVE PROFILE IN DHUB YET
    //.select( ['MBS_User.UserDhubId as userId', 'MBS_User.ApiToken as userToken', 'User.Name as userName', 'Profile.Name as profileName' ] ).where( wheres )
    .select( ['MBS_User.UserDhubId as userId', 'User.Name as userName' ] )
    .where( wheres )
    .then( function( rows ) {
      if( rows.length == 1 ) {
        mylog.debug( 'authenticated user:', rows[0] );
        //////////////////////////
        console.warn( 'WARNING!!!!!  Profile table not currently in DHUB - everyone is admin' );
        rows[0].profileName = 'admin';
        //////////////////////////
        if( !req.optum ) req.optum = { }; req.optum.userInfo = rows[0];
        next();
      }
      else {
        mylog.debug( 'error trying to authenticate: #rows', rows.length );
        return res.status( Constants.HTTP_RESPONSE_STATUS.FORBIDDEN.status ).json( { status: 'UNAUTHORIZED', message: 'User not authorized' } );
      }
    })
    .catch( function (err ) {
      mylog.debug( 'error trying to authenticate:', err );
      return res.status( Constants.HTTP_RESPONSE_STATUS.FORBIDDEN.status ).json( { status: 'UNAUTHORIZED', message: 'User not authorized' } );
    });
};

var authenticateUser = function( req, res, next ) {

  var token = req.query[ AccessControlConstants.tokenKey ] ;
  if( token ) {
    mylog.debug( 'authenticating user by token:', token.substring( 0, 8 )+'...' );
    authenticateUserByToken( req, res, next );
  }
};


var authorizeProfile = function( profileName, object, operation ) {
  mylog.debug('authorizing profile:', profileName, 'for obj:', object, 'for op:', operation );
  var msg;
  if( !Profiles[ profileName ] ) msg = 'unknown profile (' + profileName + ')';
  else if( !Profiles[ profileName ] [ object ] ) msg = 'unknown table (' + object + ') for profile(' + profileName + ')';
  else if( !Profiles[ profileName ] [ object ] [ operation ] ) msg = 'no ' + operation + ' access to object (' + object + ') for profile (' + profileName + ')';
  return msg;
};

var AccessExports = {
  constants: AccessControlConstants,
  authenticateUser: authenticateUser,
  authorizeProfile: authorizeProfile,
}

module.exports = AccessExports;
