'use strict';
/* ***********************************************************************************
account.js

This is the server-side model for the Account object.  Main things to do here are
1) Define fieldset extensions (ie define join functions for db to grab fields in fieldset
2) Extend base Model class with specifics for this object
** ***********************************************************************************/

// Underscore is generally a good thing, especially for its extend fn
var _ = require( 'underscore' );
// Define logger for this module
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dhubaccount' );
// Get common DHUB Model object
var BaseModel = require( '../lib/model.js' );
// Get common Account object
var Account = require( '../../common/models/account.js' );


// For each fieldset, make sure we have joins defined to get there
var FieldSetExtensions = {
  test: { // just id and name
    joinFn: function( knexcmd ) {
      return knexcmd.innerJoin('RecordType', 'RecordType.Id', '=', 'Acocunt.RecordTypeId');
    },
  },
  default: {
    joinFn: function( knexcmd ) {
        return knexcmd
          .innerJoin('RecordType', 'Account.RecordTypeId', '=', 'RecordType.Id' )
          .leftOuterJoin( 'Account as Parent', 'Account.ParentId', '=', 'Parent.Id' )
          .leftOuterJoin( 'Contact as Primary_Contact__r', 'Account.ParentId', '=', 'Parent.Id' )
      ;
    },
  },
  details: {
    joinFn: function( knexcmd ) {
        return knexcmd
          .innerJoin('RecordType', 'Account.RecordTypeId', '=', 'RecordType.Id' )
          .leftOuterJoin( 'Account as Parent', 'Account.ParentId', '=', 'Parent.Id' )
          .leftOuterJoin( 'Contact as Primary_Contact__r', 'Account.ParentId', '=', 'Parent.Id' )
        ;
    },
  },
}


// Extend common Account model with DHUB API extensions.
class DhubAccount extends Account {
  constructor( opts ) {
    super( opts );
    var model = this;

    // Extend fieldsets with join functions necessary to get data
    for( var fse in FieldSetExtensions ) {
      if( model.metadata.fieldsets[ fse ] && FieldSetExtensions[ fse ] ) {
        _.extend( model.metadata.fieldsets[ fse ], FieldSetExtensions[ fse ] );
      }
    }
  }

  // the 'get' function for a accountt just calls the generic 'get' function
  dbGet( parsedRequest ) {
    mylog.debug( 'dbGet: start: id:', parsedRequest.objectId, ' fieldset:', parsedRequest.fieldSet, ' filter:', parsedRequest.filter );
    return BaseModel.dbGet( this, parsedRequest);
  }

}

module.exports = DhubAccount;

