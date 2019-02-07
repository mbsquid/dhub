/*************************************************************************************************
BaseModel

For the basic Model object, we wanted something that can be used on client & server applications,
and that supported some basic event type notifications.

For now, using Backbone's Model as that base model.  Not sure if its the right long-term choice.

Enhancing the basic model with some metadata to help define various attributes/behavior.
**************************************************************************************************/
'use strict';

var _ = require( 'underscore' );
var logger = require( './logger.js' ).getLogger( 'common.lib.model' );
const constants = require( './constants.js' );
var Backbone = require( 'backbone' );


var BaseModelParms = {
  metadata: {
    // The 'type' of the model is the Object name - ie Contact, Account, etc
    type: 'BaseModel',
    // The 'label' of the object is how to describe/show it in a UI in singular and plural form
    label: { single: 'SingleLabel', plural: 'PluralLabel', },
    // The default fieldsets are the fieldsets used when none are provided in the query - there are different ones
    // for when an Id is given in the URL path or not
    defaultSingleFieldset: 'details',
    defaultMultiFieldset: 'default',
    // Defaults provide default values for attributes of the object - used by Backbone as part of initializing
    defaults: { Id: undefined, Name: undefined },
    // Identify the date and date time fields so they can be formatted/processed correctly
    dateFields: [],
    datetimeFields: [],
    // foreignkeyFields identifer lookup/pointer relationships from this object to help guide 'join' type ops
    // NOTE: not sure if need/want these just yet
    foreignkeyFields: {},
    // Fieldsets provide a shorthand for a list of fields to query
    fieldsets: {
      default: { fields: [ 'Id', 'Name' ] },
      details: { fields: [ 'Id', 'Name' ] },
    },
    // Filters provide a way to limit the output (ie part of a where clause) - ie only show records where LastName=Smith, etc
    filters: {
      default: {
        label: 'All',
        fieldset: 'default',
        order: 'Name ASC',
        limit: constants.API.defaultLimit,
      }
    },
  },
};



// For the constructor, extend the Backbone.Model with the metadata
class BaseModel extends Backbone.Model {
  constructor( options, metadata ) {

    var newopts = ( metadata.defaults ? _.extend( {}, metadata.defaults, options ) : options );
    super( newopts );

    this.metadata = metadata;
	}

}

module.exports = BaseModel;

