# optum

This is a quick attempt at an express implementation for Optum Care Services DHUB APIs,
with a further goal of developing a generic environment where we can develop common
server and client capabilities.

This software uses `node.js` and `express.js` as the server software.   You'll need `node` and `npm`
installed on your computer.

## Installing

Use `github` to get the softawre, currently housed at `https://github.com/mbsquid/optum`.   You can clone the repository
using the normal git commands
```
git clone git clone https://github.com/mbsquid/optum [LOCAL_DIR]
```
where `LOCAL_DIR` is the directory you want to store the repository (if not `optum`).


Use `npm` to install the required packages for the server.
```
cd optum
npm install
```

After that, you should be ready to start the DHUB api server. .

## Starting

The API server can be started with the usual npm startup commands
```
npm start
```
Some environment variables that may be of interest include:
- `DEBUG` - can be used to enable debugging.  For development environments, you may want to use `DEBUG=*` (debugs everything) or `DEBUG=optum*` which debugs only the optum specific modules (not the installed modules). Defaults to nothing.
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
- `fieldset` - defines a set of fields/attributes to return on this query
- `filter` - defines which records to return (defines a where clause)
- `limit` - the maximum number of records to return.  Default is defined in defaultLimit in `common/lib/constants.js` (currently 25).  
- `offset`- the offset in a list of records to return - ie return records starting at the 10th.  Defaults to defaultOffset in `common/lib/constants.js` (currently 0 - beginning of the list).
- `orderby` - the order criteria for the records returned - ie `orderby=Contact.LastName` or `orderby=Contact.LastName,DESC,Contact.FirstName`.  The format of the value is `FIELD_NAME1[,ASC|DESC][,FIELD_NAME2][,ASC|DESC]...`.  



## Authentication

The current authentication mechanism is by an authorization token (`authToken` in the query parameters).   Each user is assigned an `authToken` and when provided on the query string, it identifies the user as the requestor.  

Note: this is not the only authentication mechanism that will be supported, just wanted something quick and dirty first.   
