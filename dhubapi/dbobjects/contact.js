'use strict';

var _ = require( 'underscore' );
var mylog = require( '../../common/lib/logger.js' ).getLogger( 'dbcontact' );

var Base = require( '../lib/model.js' );
var Contact = require( '../../objects/contact/contact.js' );


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

  dbGet( parsedRequest ) {
    mylog.debug( 'dbGet: start: id:', parsedRequest.objectId, ' fieldset:', parsedRequest.fieldSet, ' filter:', parsedRequest.filter );
    return Base.dbGet( this, parsedRequest);
  }

}

module.exports = DhubContact;

