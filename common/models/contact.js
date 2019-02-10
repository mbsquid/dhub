'use strict';
var _ = require( 'underscore' );
var moment = require( 'moment' );
require( 'moment-timezone' );
var Backbone = require( 'backbone' );
var CommonLibModel = require( '../../common/lib/model.js' );
//var templates = require('./contact.html');
var constants = require( '../../common/lib/constants.js' );
var selects = require( '../../common/lib/selects.js' );
var object = module.exports = { models: {}, collections: {}, views: {} };
var logger = require( '../../common/lib/logger.js' ).getLogger('Contact');
var knex = require( 'knex' ); // MBS shouldn't be here



var ContactMetadata = {
  type: 'Contact',
  label: { single: 'Contact', plural: 'Contacts' },
  defaults: {
    "AccountId": undefined,
    "Account.Name": undefined,
    "Active__c": true,
    "Birthdate": undefined,
    "ClinicalInfoContactMethod__c": undefined,
    "ConactMethodForAssessment__c": undefined,
    "OwnerId": undefined,
    "Owner.Name": undefined,
    "RecordTypeId": undefined,
    "RecordType.Name": undefined,
    "ContactMethodForRewardCardFulfillment__c": undefined,
    "CreatedById": undefined,
    "CreatedBy.Name": undefined,
    "CreatedDate": undefined,
    "Credentials__c": undefined,
    "CurrentContactForPCP__c": undefined,
    "Date_of_Death__c": undefined,
    "Deceased__c": undefined,
    "DHUB_Id__c": undefined,
    "DoNotCall": undefined,
    "Do_Not_Mail__c": undefined,
    "Do_Not_Text__c": undefined,
    "Email": undefined,
    "FirstName": undefined,
    "HasOptedOutOfEmail": undefined,
    "Id" : undefined,
    "Enable__c": true,
    "Gender__c": selects.GENDER.UNSPECIFIED.value,
    "ContactMethodForHomeVisit__c": undefined,
    "IMS_ID__c": undefined,
    "Language__c": selects.LANGUAGE.UNSPECIFIED.value,
    "LastModifiedDate": undefined,
    "LastName": undefined,
    "MiddleName": undefined,
    "Name": undefined,
    "Service_Denial__c": false,
    "Timezone__c": selects.US_TIMEZONE_NAMES.AMERICA_UNSPECIFIED.value,
  },
  dateFields: [ 'Birthdate', 'Date_of_Death__c' ],
  datetimeFields: [ 'CreatedDate', 'LastModifiedDate' ],
  foreignkeyFields: {
    Account: { type: 'Account', joinField: 'AccountId', joinField2: 'Id', },
    ContactMethodForHomeVisit__r: { type: 'ContactMethod', joinField: 'ContactMethodForHomeVisit__c',  joinField2: 'Id', },
  },
  fieldsets : {
    test: {
      fields: [
        'Contact.Id', 'Contact.Name', 'Contact.RecordTypeId', 'RecordType.Name as RecordType.Name'
      ],
    },
    default: {
      fields: [
        "Contact.Id", "Contact.DHUB_Id__c", "Contact.FirstName", "Contact.MiddleName", "Contact.LastName", "Contact.Name", "Contact.Birthdate",
        "Contact.Deceased__c", "Contact.Date_of_Death__c", "Contact.Enable__c",
        "Contact.CreatedDate", "Contact.LastModifiedDate",
        "Contact.AccountId", "Account.Name as Account.Name",
        "Contact.RecordTypeId", "RecordType.Name as RecordType.Name"
      ],
    },
    details: {
      fields: [
        "Contact.Id", "Contact.DHUB_Id__c", "Contact.FirstName", "Contact.MiddleName", "Contact.LastName", "Contact.Name", "Contact.Birthdate",
        "Contact.Deceased__c", "Contact.Date_of_Death__c", "Contact.Enable__c",
        "Contact.AccountId", "Account.Name as Account.Name",
        "Contact.RecordTypeId", "RecordType.Name as RecordType.Name",
        "Contact.Gender__c", "Contact.Language__c", "Contact.Timezone__c",
        "Contact.DHUB_ID__c",
        // contact restrictions
        "Contact.DoNotCall", "Contact.Do_Not_Mail__c", "Contact.Do_Not_Text__c", "Contact.HasOptedOutOfEmail", "Contact.Service_Denial__c",
        // owner/created/lastmodidifed
        "Contact.OwnerId", "Owner.Name as OwnerName", "Contact.CreatedById", "CreatedBy.Name as CreatedBy.Name", "Contact.CreatedDate", "Contact.LastModifiedById", "LastModifiedBy.Name as LastModifiedBy.Name", "Contact.LastModifiedDate",
        // contact method details - home visit
        /*
        "ContactMethodForHomeVisit__c", "ContactMethodForHomeVisit__r.AddressLine1__c", "ContactMethodForHomeVisit__r.City__c",
        "ContactMethodForHomeVisit__r.State__c", "ContactMethodForHomeVisit__r.ZipCode__c", "ContactMethodForHomeVisit__r.Latitude__c",
        "ContactMethodForHomeVisit__r.Longitude__c",
        // contact method details - mail
        "ContactMethodForMail__c", "ContactMethodForMail__r.AddressLine1__c", "ContactMethodForMail__r.City__c",
        "ContactMethodForMail__r.State__c", "ContactMethodForMail__r.ZipCode__c", "ContactMethodForMail__r.Latitude__c",
        "ContactMethodForMail__r.Longitude__c",
        // contact method details - reward card
        "ContactMethodForRewardCardFulfillment__c", "ContactMethodForRewardCardFulfillment__r.AddressLine1__c", "ContactMethodForRewardCardFulfillment__r.City__c",
        "ContactMethodForRewardCardFulfillment__r.State__c", "ContactMethodForRewardCardFulfillment__r.ZipCode__c", "ContactMethodForRewardCardFulfillment__r.Latitude__c",
        "ContactMethodForRewardCardFulfillment__r.Longitude__c"
        */
      ],
    },
    withVisitAddr: {
      fields: [
        "Contact.Id", "Contact.DHUB_Id__c", "Contact.FirstName", "Contact.MiddleName", "Contact.LastName", "Contact.Name", "Contact.Birthdate",
        "Contact.Deceased__c", "Contact.Date_of_Death__c", "Contact.Enable__c",
        "Contact.CreatedDate", "Contact.LastModifiedDate",
        "Contact.AccountId", "Account.Name as Account.Name",
        "ContactMethodForHomeVisit__c", "ContactMethodForHomeVisit__r.AddressLine1__c", "ContactMethodForHomeVisit__r.City__c",
        "ContactMethodForHomeVisit__r.State__c", "ContactMethodForHomeVisit__r.ZipCode__c",
        "ContactMethodForHomeVisit__r.Latitude__c", "ContactMethodForHomeVisit__r.Longitude__c"
      ],
    },
  },
  filters: {
    defaultList: {
      label: "All",
      fieldset: "default",                // by default
      orderby: [ { column: 'Contact.LastName', order: 'ASC' }, { column: 'Contact.FirstName', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
    },
    defaultSingle: {
      label: "All",
      fieldset: "details",                // by default
      orderby: [ { column: 'Contact.LastName', order: 'ASC' }, { column: 'Contact.FirstName', order: 'ASC' } ],   // by default
      limit: 1,
    },
    individuals: {
      label: "Individuals",
      fieldset: "default",                // by default
      orderby: [ { column: 'Contact.LastName', order: 'ASC' }, { column: 'Contact.FirstName', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
      where: { "RecordType.Name": "Individual" }
    },
  },
};




class Contact extends CommonLibModel {
  constructor( opts ) {

    super( opts, ContactMetadata );

    this.setName();
    this.on( 'change:FirstName', this.setName, this );
    this.on( 'change:MiddleName', this.setName, this );
    this.on( 'change:LastName', this.setName, this );

  }

  validate( attrs, opts ) {
    logger.debug('validate: attrs:', attrs, ' opts:', opts );

    // need last name
    if(attrs.LastName === undefined || attrs.LastName.length <= 0) return 'Last name required';

    // DoB has to be past
    if( attrs.Birthdate && (new Date()).getTime() <= (new Date( attrs.Birthdate )).getTime() ) return 'Birthdate not in past';

    // date of death has to be past
    if( attrs.Date_of_Death__c && (new Date()).getTime() <= (new Date( attrs.Date_of_Death__c )).getTime() ) return 'Date of death not in past';

  }

  setName() {
    var model = this, fn = model.get('FirstName'), mn = model.get( 'MiddleName' ), ln = model.get( 'LastName' );
    var n = (fn ? fn.trim() + ' ' : '') + ( mn ? mn.trim() + ' ' : '' ) + ( ln ? ln.trim() : '' );
    model.set( { Name : n } );
  }
}


/*
var c = new Contact( { FirstName: 'Matt', LastName: 'Squire' } );
c.set( { MiddleName: 'Blaze', FirstName: 'Matthew' } );
logger.log('CONTACT c:', c );
*/












/*
object.views.Contact_Default = Backbone.View.extend({
  tagName: 'div',
  className: 'stdDefault',
  template: templates[ "template-Contact_Default" ],
  initialize: function( opts ) {
    var thisview = this;
  },
  events: {
  },
  render: function() {
    var thisview = this;

    thisview.$el.html(thisview.template(thisview.model.toJSON()));

    return thisview;
  },
});
*/




module.exports = Contact;






