'use strict';
/* ***********************************************************************************
Contact.js

This is the server-side model for the Contact object.  Main things to do here are
1) Define fieldset extensions (ie define join functions for db to grab fields in fieldset
2) Extend base Model class with specifics for this object
** ***********************************************************************************/

// Underscore is generally a good thing, especially for its extend fn
var _ = require( 'underscore' );
// Define logger for this module
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dhubcontact' );
// Get common DHUB Model object
var BaseModel = require( '../lib/model.js' );
// Get common Contact object
var Contact = require( '../../common/models/contact.js' );


// For each fieldset, make sure we have joins defined to get there
var FieldSetExtensions = {
  test: { // just id and name
    joinFn: function( knexcmd ) {
      return knexcmd.innerJoin('RecordType', 'RecordType.Id', '=', 'Contact.RecordTypeId');
    },
  },
  default: {
    joinFn: function( knexcmd ) {
        return knexcmd
          .innerJoin('RecordType', 'Contact.RecordTypeId', '=', 'RecordType.Id' )
          .innerJoin( 'Account', 'Contact.AccountId', '=', 'Account.Id' );
      },
  },
  details: {
    joinFn: function( knexcmd ) {
        return knexcmd
          .innerJoin('RecordType', 'Contact.RecordTypeId', '=', 'RecordType.Id' )
          .innerJoin( 'Account', 'Contact.AccountId', '=', 'Account.Id' )
          .innerJoin( 'User as Owner', 'Contact.OwnerId', '=', 'Owner.Id' )
          .innerJoin( 'User as CreatedBy', 'Contact.CreatedById', '=', 'CreatedBy.Id' )
          .innerJoin( 'User as LastModifiedBy', 'Contact.LastModifiedById', '=', 'LastModifiedBy.Id' )
        ;
      },

  },
}


// Extend common Contact model with DHUB API extensions.
class DhubContact extends Contact {
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

  // the 'get' function for a contact just calls the generic 'get' function
  dbGet( parsedRequest ) {
    mylog.debug( 'dbGet: start: id:', parsedRequest.objectId, ' fieldset:', parsedRequest.fieldSet, ' filter:', parsedRequest.filter );
    return BaseModel.dbGet( this, parsedRequest);
  }

}

module.exports = DhubContact;

