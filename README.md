# DHUB Javascript Code

This is a quick attempt at an express implementation for DHUB APIs,
with a further goal of developing a generic environment where we can develop common
server and client capabilities.

This software uses `node.js` and `express.js` as the server software.   You'll need `node` and `npm`
installed on your computer.

## Installing

Use `github` to get the softawre, currently housed at `https://github.com/mbsquid/dhub`.   You can clone the repository
using the normal git commands
```
git clone git clone https://github.com/mbsquid/dhub [LOCAL_DIR]
```
where `LOCAL_DIR` is the directory you want to store the repository (if not `dhub`).


Use `npm` to install the required packages for the server.
```
cd dhub
npm install
```

After that, you should be ready to start the DHUB api server.

## Starting

The API server can be started with the usual npm startup commands
```
npm start
```
Some environment variables that may be of interest include:
- `DEBUG` - can be used to enable debugging.  For development environments, you may want to use `DEBUG=*` (debugs everything) or `DEBUG=dhub*` which debugs only the dhub specific modules (not the installed modules). Defaults to nothing.
- `NODE_ENV` - sets the environment.  Defaults to `development`.  Can be used to load different configuration.  Configuration is currently set for different environments by the file `dhubapi/lib/config.js`.
- `DHUB_IP` - set/override the IP address of the DHUB database as defaulted in `config.js`.  
- `DHUB_USER`- set/override the username to access the DHUB database as defaulted in `config.js`.
- `DHUB_PW` - set the password to access this DHUB database.  This parameters should be required in most environments as we generally don't want to store passwords in the repository.
- `DHUB_DB` - set the database name to use to access DHUB as defaulted in `config.js`.
- `PORT` - set/override the HTTPS port on which to start the API service as defaulted in `config.js`.  

Command line environment variables always override the configuration values as given in `config.js`.  

The more expected way to start the API server in a development environment is
```
DEBUG=* NODE_ENV=development DHUB_PW=PASSWORD npm start
```
where `PASSWORD` is of course the actual password that allows access to the DHUB database.  The `DHUB_PW` variable is really the only required value as you need to pass it a password that allows database access.  



## Calling the API

Currently, only implemented some GET capabilities in the API.  In the near future these will be extended to POST, PUT, etc.


### Using the GET API
Assuming you are running the DHUB API server on your local machine, you would access the API server with a URL like
```
https://localhost:PORT/api/OBJECT[/ID]?query_string
```

The `PORT` defaults to 3001 in `config.js`.   

The `OBJECT` value is an identifier for the type of object you want to access in the database.  The list of `OBJECT` values supported is defined in the `APIGlobals` object in  `dhubapi/routes/dbapi.js`.  

The `ID` value is optional.   If provided, it is used to match the `DHUB_ID__c` value in a particular row of the target table.   

An example URL for the API server could be:
```
https://localhost:3001/api/contact/1?authToken=YOUR_AUTH_TOKEN?fieldset=default
https://localhost:3001/api/contact?limit=8&recordtype.name=provider&orderby=lastName,DESC&authToken=YOUR_AUTH_TOKEN
```

See the Authentication section to understand the `authToken` parameter.  Other query parameters that are important include:
- `fieldset` - defines a set of fields/attributes to return on this query.  There are two fieldsets that are defined for every object (others may vary per object).  The fieldset `default` is the fieldset intended to return minimal information that we may want in a related list type display.  The fieldset `details` is intended as the fieldset for display of a detail record, where we show pretty much everything about a record (it should have pretty much all fields that may ever be of interest).  The `details` fieldset is the fieldset used when an object identifier is provided (so only a single record is returned).  The `default` fieldset is the default fieldset used when no `Id` is provided (so many records may be returned).  Supplying the `fieldset` parameter on a query string overrides those defaults.
- `filter` - defines which records to return (defines a where clause)
- `limit` - the maximum number of records to return.  Default is defined in `defaultLimit` in `common/lib/constants.js` (currently 25).  
- `offset`- the offset in a list of records to return - ie return records starting at the 10th.  Defaults to  `defaultOffset` in `common/lib/constants.js` (currently 0 - beginning of the list).
- `orderby` - the order criteria for the records returned - ie `orderby=Contact.LastName` or `orderby=Contact.LastName,DESC,Contact.FirstName`.  The format of the value is `FIELD_NAME1[,ASC|DESC][,FIELD_NAME2][,ASC|DESC]...`.  If `ASC` or `DESC` is not provided, it is assumed to be `ASC`.  


### Response Format
The format of a response is by default a JSON object (other formats may be added in the future - HTML, CSV, etc).   The response generally looks like:
```
{
  "status": "OK",
  "rowsInfo" : { OBJECT },
  "parsed": { OBJECT },
  "objects": [ {OBJECT1}, {OBJECT2}, ...]
}
```

Each field is described in more detail below:
- `status` - a String, either `OK` or `ERROR`.  Will only be `ERROR` if the query was not able to be processed or executed properly.
- `objects` - an Array of Objects, each representing one record. The attributes included in the Object depend on the object definition (in `common/models/OBJECTNAME.js`), and the `fieldset` parameter (provided in query string or defaulted). The length of the array (`objects.length`) indicates the actual number of objects returned.  Some FYIs on the data format:
  * `date` fields are returned in the format `YYYY-MM-DD`
  * `datetime` fields are returned in the format `YYYY-MM-DDTHH:mm:ss.SSS[Z]` (so in UTC timezone, independent of user or database location)
- `rowsInfo` - an Object that describes the number and position of rows, and can be used for pagination.  The attributes of the `rowsInfo` object include
  * `offset` - the offset of the returned values in the total list of possible matching values
  * `limit` - the number of rows returned
  * `totalRows` - the total number of possible matching entries

  So the `rowsInfo` attribute looks like
  ```
  { limit: 25, offset: 0, totalRows: 235 }
  ```
  These values can be used for pagination (ie Showing items `offset+1` thru `offset+objects.length+1` of `totalRows`).  
- parsed - an Object that describes how the API server understood the request.  It lists the parameters that applied to the query and is included for informative/debugging purposes.  An example `parsed` object is below (this example may not be complete as the project evolves).
```
{
  "originalUrl":"/api/contact/?authToken=MYTOKEN&limit=4&fieldset=details",
  "filter":"defaultList",
  "fieldset":"details",
  "limit":"10",
  "offset":null,
  "orderby":null,
  "unknowns":{},
  "parseError":null,
  "authToken":"MYTOKEN",
  "user":{
      "userId":"48",
      "userName":"Matt Squire",
      "profileName":"admin"},
  "objectType":"contact",
  "objectId":""
}
```


## Authentication

The current authentication mechanism is by an authorization token (`authToken` in the query parameters).   Each user is assigned an `authToken` and when provided on the query string, it identifies the user as the requestor.  

Note: this is not the only authentication mechanism that will be supported, just wanted something quick and dirty first.   


## Authorization
