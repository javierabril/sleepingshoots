/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var express = require('express')
    , http = require('http')
    , nconf = require('nconf')
    , bodyParser = require('body-parser')
    , jwt = require('jsonwebtoken')
    , sha = require('sha256')
    , path = require('path');


var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    // app.use(bodyParser.json());

});

app.configure('development', function () {
    app.use(express.errorHandler());
});



require('./routes/services')(app);

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});