'use strict';
var _ = require( 'underscore' );
var moment = require( 'moment' );
require( 'moment-timezone' );
var Backbone = require( 'backbone' );
var CommonLibModel = require( '../../common/lib/model.js' );
var constants = require( '../../common/lib/constants.js' );
var selects = require( '../../common/lib/selects.js' );
var object = module.exports = { models: {}, collections: {}, views: {} };
var logger = require( '../../common/lib/logger.js' ).getLogger('common-acct');



var AccountMetadata = {
  type: 'Account',
  label: { single: 'Account', plural: 'Accounts' },
  defaults: {
    // Standard stuff
    "Id" : undefined,
    "DHUB__c" : undefined,
    "Name" : undefined,
    "isDeleted" : undefined,
    "Enabled__c" : undefined,
    "isActive__c" : undefined,
    "RecordTypeId": undefined,
    "RecordType.Name": undefined,
    "OwnerId": undefined,
    "Owner.Name": undefined,
    "CreatedById": undefined,
    "CreatedBy.Name": undefined,
    "CreatedDate": undefined,
    "LastModifiedDate": undefined,
    "LastModifiedById" : undefined,
    "LastModifiedBy.Name" : undefined,

    // Account specific stuff
    "AccountNumber": undefined,
    "isActive__c": true,
    "Active_Calc__c": true,
    "Benefit_Plan_Name__c": undefined,
    "ColorCode_Actual__c" : undefined,
    "ColorCode_Actual_Sample__c": undefined,
    "ColorCode_Configured__c" : undefined,
    "ColorCode_Sample__c" : undefined,
    "ContactID__c" : undefined,
    "Employer_Group__c": undefined,
    "Enforce_Program_Inheritance__c" : undefined,
    "Family_Plan_Name__c" : undefined,
    "Group_Number__c" : undefined,
    "Group_Number_Name__c" : undefined,
    "Internal_Plan_Name__c" : undefined,
    "Internal_Plan_Name_Configured__c" : undefined,
    "InternalIdentifier__c" : undefined,
    "Line_Of_Business__c" : undefined,
    "Master_Client_Name__c": undefined,
    "Master_Client__c" : undefined,
    "Nth__c" : undefined,
    "Offshore_Restricted__c" : undefined,
    "OperatingHoursId" : undefined,
    "ParentId" : undefined,
    "ParentName": undefined,
    "Plan__c" : undefined,
    "Plan_Name__c" : undefined,
    "Plan_ID__c" : undefined,
    "Primary_Contact__c" : undefined,
    "Primary_Contact__r.Name" : undefined,
    "Reason__c" : undefined,
    "Short_Code__c" : undefined,
    "Sub_Client_Name__c" : undefined,
    "Sub_Client__c" : undefined,
    "Timezone__c" : undefined,

  },
  dateFields: [  ],
  datetimeFields: [ 'CreatedDate', 'LastModifiedDate' ],
  foreignkeyFields: {
    ParentId: { type: 'Account', as: 'ParentAccount', joinField: 'ParentId', joinField2: 'ParentAccount.Id', },
    Primary_Contact__c: { type: 'Contact', joinField: 'Primary_Contact__c', joinField2: 'Primary_Contact__c.Id' },
  },
  fieldsets : {
    test: {
      fields: [
        'Account.Id', 'Account.Name', 'Account.RecordTypeId', 'RecordType.Name as RecordType.Name'
      ],
    },
    default: {
      fields: [
        "Account.Id", "Account.DHUB_Id__c", "Account.Name",
        "Account.CreatedDate", "Account.LastModifiedDate",
        "Account.RecordTypeId", "RecordType.Name as RecordType.Name",
        "Account.ParentId", "Parent.Name",
        "Account.Primary_Contact__c", "Primary_Contact__r.Name"
      ],
    },
    details: {
      fields: [
        "Account.Id", "Account.DHUB_Id__c", "Account.Name",
        "Account.CreatedDate", "Account.LastModifiedDate",
        "Account.RecordTypeId", "RecordType.Name as RecordType.Name",
        "Account.ParentId", "Parent.Name",
        "Account.Primary_Contact__c", "Primary_Contact__r.Name"
        // MBS NEED REST OF STUFF
      ],
    },
  },
  filters: {
    defaultList: {
      label: "All",
      fieldset: "default",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
    },
    defaultSingle: {
      label: "All",
      fieldset: "details",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: 1,
    },
    clients: {
      label: "Clients",
      fieldset: "default",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
      where: { "RecordType.Name": "Client" }
    },
    lobs: {
      label: "Lines of Business",
      fieldset: "default",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
      where: { "RecordType.Name": "Line Of Business" }
    },
    masters: {
      label: "Master Clients",
      fieldset: "default",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
      where: { "RecordType.Name": "Master Client" }
    },
    individuals: {
      label: "Individuals",
      fieldset: "default",                // by default
      orderby: [ { column: 'Account.Name', order: 'ASC' } ],   // by default
      limit: constants.API.defaultLimit,
      where: { "RecordType.Name": "Individual" }
    },
  },
};




class Account extends CommonLibModel {
  constructor( opts ) {

    super( opts, AccountMetadata );

  }

  validate( attrs, opts ) {
    logger.debug('validate: attrs:', attrs, ' opts:', opts );

    // need last name
    if( !attrs.Name || attrs.Name.length <= 0) return 'Name required';

    // Record type needed
    if( !attrs.RecordTypeId ) return "Record type required";


  }

}









module.exports = Account;






