'use strict';

var _ = require( 'underscore' );
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'server.lib.model' );
const constants = require( './constants.js' );
var knex = require( './dhub.js' );
var moment = require( 'moment' );



// Dates will be returned as strings like YYYY-MM-DD
var processDbRow4Dates = function( dbrow, metadata) {
  // Change dates to YYYY-MM-DD format
  if( metadata.dateFields ) metadata.dateFields.forEach( function( d ) {
    if( dbrow[ d ] ) dbrow[ d ] = moment( dbrow[ d ] ).utc().format( constants.DateFormats.FORMAT_YMD );
  });
}

// Datetimes will be returned as UTC in YYYY-MM-DDTHH:mm:ss.SSSZ format
var processDbRow4Datetimes = function( dbrow, metadata ) {
  // Ensure date/time fields are zulu time - databases don't always do this
  if( metadata.datetimeFields ) metadata.datetimeFields.forEach( function( d ) {
    if( dbrow[ d ] ) dbrow[ d ] = moment( dbrow[ d ] ).utc().format( constants.DateFormats.FORMAT_YMDHMSMZ );
  });
}

// Aggreate fields like x.y, x.z into an object x:{y,z}
// Want to return such data both ways ('.' attributes and sub-objects) to be as flexible as possible
var processDbRow4Objects = function( dbrow, metadata ) {
  for( var a in dbrow ) {
    var i = a.indexOf( '.' );
    if( i > 0 ) {
      var subobj = a.substring( 0, i ), subattr = a.substring( i+1 );
      if( !dbrow[ subobj ] ) dbrow[ subobj ] = {};
      dbrow[ subobj ][ subattr ] = dbrow[ a ];
    }
  }
  // Make a 2nd pass to pick up things like "AccountId: xxx" for Account:{ Id: xxx }, but only if have other attrs with it
  for( var a in dbrow ) {
    var i = a.indexOf( 'Id' );
    if( i > 0 ) {
      var root = a.substring( 0, i );
      if( dbrow[ root ] ) dbrow[ root ][ 'Id' ] = dbrow[ a ] ;
    }
    else if( (i = a.indexOf( '__c' ) > 0 ) ) { // freakin SF naming crap - sometimes x.zzz__c == x.zzz__r.Id
      var root = a.substring(0, i-1 ) + 'r';
      if( dbrow[ root ] ) dbrow[ root ][ 'Id' ] = dbrow[ a ] ;
    }
  }
}


var processDbRow = function( dbrow, metadata ) {

  // handle date fields
  processDbRow4Dates( dbrow, metadata );

  // handle datetime fields
  processDbRow4Datetimes( dbrow, metadata );

  // turn x.y,x.z into x:{y,z}
  processDbRow4Objects( dbrow, metadata );

};




var dbGet = function( model, parsed ) {
  mylog.debug( 'dbGet for obj:', model.metadata.type, ' id:', parsed.objectId );
  var fieldset = model.metadata.fieldsets[ parsed.fieldset ] ;
  if( !fieldset ) throw 'Unknown fieldset (' + parsed.fieldset + ')';
  var filter = model.metadata.filters[ parsed.filter ];
  if( !filter ) throw 'Unknown filter (' + parsed.filter + ')';

  var limit = parsed.limit || filter.limit || constants.API.defaultLimit;
  var offset = parsed.offset || filter.offset || constants.API.defaultOffset;
  var orderby = parsed.orderby || filter.orderby || constants.API.defaultOrderby;

  var whereParams = _.extend( {}, filter.where || {}, parsed.unknowns ); // only want not deleted
  whereParams[ model.metadata.type + '.IsDeleted' ] = false;
  if( parsed.objectId ) whereParams.Id = parsed.objectId;

  // Basic query - includes where clause (based on query parameters), limit, offset, & order by [based on query and/or filter and/or globals
  var kcmd =  knex.select( fieldset.fields ).from( model.metadata.type )
    .where( whereParams )
    .limit( limit )
    .offset( offset )
    .orderBy( orderby );

  // Now we have to customize that query for whatever joins are required - use joinFn from fieldset or default
  if( fieldset.joinFn ) kcmd = fieldset.joinFn( kcmd );


  return new Promise( function( resolve, reject ) {
    // probably don't need transaction but...
    knex.transaction( function( trx ) {

      kcmd.transacting(trx)
      .then( function( rows ) {
        if( parsed.objectId ) {
          // in this case we know there's only one object, so don't need to do count query
          var rowsInfo = { limit: limit, offset: parsed.offset, totalRows: rows.length };
          trx.commit();
          rows.forEach( function( r ) { processDbRow( r, model.metadata ); });
          resolve( { rowsInfo: rowsInfo, parsed: parsed, objects: rows } );
        }
        else {
          var cmd = knex.count( model.metadata.type + '.DHUB_Id__c as cnt' ).from( model.metadata.type ).where( whereParams );

          // joins required for fieldset
          if( fieldset.joinFn ) cmd = fieldset.joinFn( cmd );

          cmd
            .then( function( rows2 ) {
              var rowsInfo = { limit: limit, offset: parsed.offset, totalRows: rows2[0].cnt };
              trx.commit();
              rows.forEach( function( r ) { processDbRow( r, model.metadata ); });
              resolve( { rowsInfo: rowsInfo, parsed: parsed, objects: rows } );
            })
            .catch( function ( e ) {
              trx.rollback( e );
              reject( e );
            });
        }
      })
      .catch( function( err ) {
        reject( err );
      });
    })
    .then( function( transresponse ) {
      mylog.debug( 'transaction complete' );
    })
    .catch( function( transerr ) {
      mylog.debug( 'transaction error:', transerr );
    });
  });

};


var BaseMixin = {
  dbGet: dbGet,
}

module.exports = BaseMixin;

