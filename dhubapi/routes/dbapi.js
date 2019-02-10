'use strict';

// Node/express
var express = require('express');
var router = express.Router();
var _ = require( 'underscore' );
// our constants
var constants = require( '../lib/constants.js' );
// logging
var mylog = require('../lib/logger-server.js').getLogger( 'dbapi' );
// access control
var Access = require( '../lib/accesscontrol.js' );

// objects
var Contact = require( '../dbobjects/contact.js' );


const APIGlobals = {
  goodTokens: [ 'fieldset', 'filter', 'offset', 'limit', 'orderby', 'authToken' ],
  badTokens: [ 'thisUserId', 'thisUserProfile' ], // for things we never want in there - ie overriding userId, etc
  objects: {
    contact: Contact,
    account: 'ACCOUNT',
    contactmethod: 'CONTACT_METHOD__C',
  },
};

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

function errorResponse( res, e ) {
  mylog.debug( 'Returning error response:', e );
  return res.json ( e );
}

function okResponse( res, dbresp ) {
  var rtnjson = _.extend( { status: 'OK' }, dbresp );
  return res.json( rtnjson );
}

// Make sure user is authenticated (not authorized)
router.use( function( req, res, next ) {
  Access.authenticateUser( req, res, next );
});

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
    return errorResponse ( res, { status: 'ERROR', message: e } );
  }



});

module.exports = router;

