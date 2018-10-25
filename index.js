/**
 * Created by Sowvik on 17-09-2018.
 */



(function (module) {

    var VERSION = 0.1;

    var express = require('express');
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');

    var app = express();
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://versat-iot.s3-website-us-east-1.amazonaws.com');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('version', VERSION);
        next();
    });
    app.use(bodyParser.json({})); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
    app.use(cookieParser("teoco"));
    app.use("/rest/security", require("./rest/login"));
    app.use("/rest/data", require("./rest/data"));
    app.listen(3000);
    module.exports = app;
})(module);
