'use strict';
/* **************************************************************************************
dbapi.js

This file defines the router for the DHUB API server.  For any request to appropriate URLs,
we will perform the appropriate operations based on the type of request.  Currently we're
only doing GET requests but that will change shortly.

For GET requests we will:
- parse the request (path and query parameters)
- perform authentication to identify the user and confirm they have access
- perform objectType authorization based on the user's profile to ensure they have
  GET access to objects of this type
- call the object specific dbGet function to return the requested data
- forward that data to the requestor as a JSON object in a HTTP response
** **************************************************************************************/

// Node/express
var express = require('express');
var router = express.Router();
var _ = require( 'underscore' );
// our constants
var constants = require( '../lib/constants.js' );
// logging
var mylog = require('../lib/logger-server.js').getLogger( 'dbapi' );
// authentication & access control
var Access = require( '../lib/accesscontrol.js' );
// objects
var Contact = require( '../dbobjects/contact.js' );
var Account = require( '../dbobjects/account.js' );



// Some global variables/controls for the API
const APIGlobals = {
  // These are known/reserved query parameters that we look for specifically
  goodTokens: [ 'fieldset', 'filter', 'offset', 'limit', 'orderby', 'authToken' ],
  // These are query parameters that are specifically not allowed
  badTokens: [ 'thisUserId', 'thisUserProfile' ],
  // These are the list/map from objecttype in the URL to a specific Model
  objects: {
    contact: Contact,
    account: Account,
    //contactmethod: ContactMethod,
  },
};




// Function to parse the HTTP request into the parameters we care about (and don't).
// Returns an object where each attribute of interest is specifically identified.
function parseRequest( req ) {
  mylog.debug( 'parseAPIRequest:', req.originalUrl );
  var rtn = {
    originalUrl: req.originalUrl,
    filter: constants.API.defaultFilter,
    fieldset: constants.API.defaultFieldset,
    limit: null,
    offset: null,
    orderby: null,
    unknowns : {},
    parseError: null,
    authToken: null,
    user: null,
  };

  // get object type & id (if there)
  var path = req.path.split('\/');
  rtn.objectType = path.length > 1 ? path[1] : null;
  rtn.objectId = path.length > 2 ? path[2] : null;
  rtn.user = req.optum.userInfo;

  // Remove/delete bad tokens
  APIGlobals.badTokens.forEach( function( v ) {
    delete req.query[ v ];
  } );

  // process good/known tokens
  APIGlobals.goodTokens.forEach( function( v ) {
    if( req.query[ v ] ) rtn[ v ] = decodeURIComponent( req.query[ v ] );
    delete req.query[ v ];
  });

  // handle unknown parameters
  // MBS XXX Need to better handle unknown query parameters - can't allow SQL injection, should allow ops other than x=y, etc
  _.extend( rtn.unknowns, req.query );

  //
  // set filter if not provided
  if( !rtn.filter ) {
    rtn.filter = rtn.objectId ? 'defaultSingle' : 'defaultList' ;
  }
  // set fieldset if not provided
  if( !rtn.fieldset ) {
    rtn.fieldset = rtn.objectId ? 'details' : 'default' ;
  }
  // parse & re-set orderby if needed
  if( rtn.orderby ) {
    var splitorderby = rtn.orderby.split(',');
    var oby = [];
    splitorderby.forEach( function( v ) {
      if( v.toUpperCase() == 'ASC' || v.toUpperCase() == 'DESC' ) {
        var last = (oby.length > 0 ? oby[ oby.length-1 ] : undefined );
        if( last ) last.order = v;
      }
      else {
        oby.push( { column: v } );
      }
    });
    rtn.orderby = oby;
  }

  return rtn;
}

// Send a response with a specific error, where the error should be a JSON object with status & message
function errorResponse( res, e ) {
  mylog.debug( 'Returning error response:', e );
  return res.json ( e );
}

// Send a response where the dbresp is included as the JSON body of the HTTP response using a 200/OK status code
function okResponse( res, dbresp ) {
  var rtnjson = _.extend( { status: 'OK' }, dbresp );
  return res.json( rtnjson );
}


// Perform authentication - make sure user is authenticated somehow
router.use( function( req, res, next ) {
  Access.authenticateUser( req, res, next );
});


// Map all GET URLs the same way, where the goal is to get to the dbGet function for
// a specific Object model (like Contact)
router.get('*', function( req, res, next ) {
  var parsed = parseRequest( req );

  if( !parsed.objectType ) {
    return errorResponse ( res, { status: 'ERROR', message: 'No object type provided' } );
  }
  var ObjClass = APIGlobals.objects[ parsed.objectType ] ;
  if( !ObjClass ) {
    return errorResponse ( res, { status: 'ERROR', message: 'Unknown object type: ' + parsed.objectType } );
  }
  var obj = new ObjClass( { id: parsed.objectId } );

  var authmsg  = Access.authorizeProfile( req.optum.userInfo.profileName, obj.metadata.type, Access.constants.CRUDLevels.READ );
  if( authmsg ) {
    return errorResponse ( res, { status: 'ERROR', message: authmsg } );
  }

  try {
    obj.dbGet( parsed )
      .then(function( dbresp ) {
        mylog.debug('database response returned', dbresp.objects.length, 'of', dbresp.rowsInfo.totalRows, 'total rows' );
        return okResponse( res, dbresp );

      })
      .catch( function( e ) {
        mylog.debug('database error:', e );
        return errorResponse ( res, { status: 'ERROR', message: e.originalError.message } );
      });
  }
  catch( e ) {
    return errorResponse ( res, { status: 'ERROR2', message: e } );
  }



});

module.exports = router;

