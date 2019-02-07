

var express = require('express');
var app = express();
var router = express.Router();
var cors = require( 'cors' );
const Constants = require( '../lib/constants.js' );
const request = require('request');
var logger = require( '../lib/logger-server' );
var wLogger = logger.getLogger('weather');


// home page - just bull for now
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Server Home Page' });
});





module.exports = router;

