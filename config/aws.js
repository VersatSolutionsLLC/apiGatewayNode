/**
 * Created by Sowvik on 28-09-2018.
 */
(function (module){
    "use strict";
    var AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: 'AKIAIETAZOSXJRVEDZ2Q',
        secretAccessKey: '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',
        region: 'us-east-1'
    });
    module.exports = AWS;
})(module);