'use strict';

/* ************************************************************************
Authentication and access control

This module controls if a user can access the API server, and how.


** ************************************************************************/

// logging
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'accesscontrol' );

// server constants
var Constants = require( './constants.js' );

// connecting to DHUB
var dhubknex = require( './dhub.js' );

// Update constants with new DHUB constants if including this
var AccessControlConstants = {
  // Not sure if I need these but adding for now - remove if don't use soon
  CRUDLevels: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
  },
  // What query parameter to look for for authentication token
  tokenKey: 'authToken',
};


// For first go-round, allow profile-based CRUD access per object type
// For each object, can specificy true or false per operation, or can list record types that op can be performed for.
// So can have "read: true", or "read: false", or "read: ['Individual', 'Provider'], etc
var Profiles = {
  admin: {  // Have CRUD access to all records...
    // Contact record types: Individual, Provider, Other Contact, Vendor Contact
    Contact: { create: true, read: true, write: true, delete: true, },
    // Account record types: Client, Employer Group, Group Number, Household, Individual, Insurance Plan, Line of Business, Master Client,
                          // Member Identifier, Physician Group, Plan Group, Provider, Resource Vendor, Sub Client
    Account: { create: true, read: true, write: true, delete: true, },
  },
  readonly: { // read access to all
    Contact: { read: true, },
    Account: { read: true, },
  },
};



// Attempt to authenticate a user via an authentication token in the query parameters
// Look up the token (needs to be unique) and identify the user by it, along with their profile
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
        return res.status( Constants.HTTP_RESPONSE_STATUS.FORBIDDEN.status ).json( { status: 'UNAUTHORIZED', message: 'User not authenticated' } );
      }
    })
    .catch( function (err ) {
      mylog.debug( 'error trying to authenticate:', err );
      return res.status( Constants.HTTP_RESPONSE_STATUS.FORBIDDEN.status ).json( { status: 'UNAUTHORIZED', message: 'User not authenticated' } );
    });
};




// Function to be called by routes engines to authenticate a user given the request/response
// Will send error response if authentication fails, and calls next() if authentication ok
var authenticateUser = function( req, res, next ) {

  var token = req.query[ AccessControlConstants.tokenKey ] ;
  if( token ) {
    mylog.debug( 'authenticating user by token:', token.substring( 0, 8 )+'...' );
    authenticateUserByToken( req, res, next );
  }
};



// Quick function to authorize a CRUD operation based on a user profile and object type
// Returns an error message if profile+op is not authorized, returns undefined if operation is ok
// MBS Need to enhance to include RecordType
var authorizeProfile = function( profileName, object, operation ) {
  mylog.debug('authorizing profile:', profileName, 'for obj:', object, 'for op:', operation );
  var msg;
  if( !Profiles[ profileName ] ) msg = 'unknown profile (' + profileName + ')';
  else if( !Profiles[ profileName ] [ object ] ) msg = 'unknown table (' + object + ') for profile(' + profileName + ')';
  else if( !Profiles[ profileName ] [ object ] [ operation ] ) msg = 'no ' + operation + ' access to object (' + object + ') for profile (' + profileName + ')';
  return msg;
};




var addProfileJoins = function( profileName, object, operation, knexcmd ) {
  mylog.debug( 'addProfileJoins for', profileName, 'on', object, 'op', operation );
  var profile = Profiles[ profileName ], cruds = profile[ object ], opcrud = cruds[ operation ];

  // If crud is false/empty, add impossible inner join
  if( !opcrud ) knexcmd.innerJoin( 'RecordType as AuthRecordType', 'AuthRecordType.Name', '=', 'RecordTypeNotExist' );
  else if( Array.isArray( opcrud ) && opcrud.length > 0 ) {
    // If crud is Array, add clauses for allowable record types
    mylog.debug( 'opcrud is array ' );
    knexcmd.innerJoin( 'RecordType as AuthRecordType', function() {
      this.on( 'AuthRecordType.Id', '=', object + '.RecordTypeId' );
      //this.on('AuthRecordType.Name', '=', dhubknex.raw( '?', [ opcrud[0] ] ) );
      this.andOn( function() {
        this.on('AuthRecordType.Name', '=', dhubknex.raw( '?', [ opcrud[0] ] ) );
        for( var i = 1; i < opcrud.length; i++ ) this.orOn( 'AuthRecordType.Name', '=', dhubknex.raw( '?', [ opcrud[i] ] ) );
      });
    });

  }
  else if( opcrud === true ) {
    // Nothing required - have full access to all record types
  }
  else {
    mylog.debug( 'opcrud is unknown value type:', opcrud );
  }
};1


// What we want to export
var AccessExports = {
  constants: AccessControlConstants,
  authenticateUser: authenticateUser,
  authorizeProfile: authorizeProfile,
  addProfileJoins: addProfileJoins,
}

module.exports = AccessExports;
