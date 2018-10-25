/**
 * Created by Sowvik on 27-09-2018.
 */
(function (module) {
    "use strict";
    var express = require('express');
    var router = express.Router();

    var AWS = require("../config/aws");

    /**
     *
     * @returns {Promise}
     * @private
     */
    function _scanDevices() {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: 'Devices'
            };

            ddb.scan(params, (err, data)=> {
                if (err) reject(err);
                else resolve(data);

            })
        });
    }

    /**
     *
     * @param from
     * @param to
     * @param imei
     * @returns {Promise}
     * @private
     */
    function _queryMetricsData(from, to, imei) {
        return new Promise((resolve, reject) => {
            var params = {
                ExpressionAttributeValues: {
                    //':form':from, //1534942247
                    //':to': to, //1534943159
                    ':imei': imei //352913090104454
                },
                //KeyConditionExpression: 'imei = :imei AND #t BETWEEN :form and :to',
                KeyConditionExpression: 'imei = :imei',
                //ExpressionAttributeNames: {
                //    "#t": "timestamp"
                //},
                TableName: 'radio'
            };

            ddb.query(params, (err, data)=> {

                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });

        });
    }

    router.get("/ping", function (req, res) {
        res.cookie('ping', "pong", {maxAge: 3200 * 1000});
        res.status(200).send("pong");
    });

// Create DynamoDB service object
    var ddb = new AWS.DynamoDB.DocumentClient();
    router.post("/metrics",
        /**
         *
         * @param req
         * @param req.body
         * @param req.body.from
         * @param req.body.to
         * @param req.body.imei
         * @param res
         */
        async function (req, res) {
            var data;

            try {
                data = await _queryMetricsData(req.body.from, req.body.to, req.body.imei)
            } catch (err) {
                var error, status;
                console.log(err);
                if (err.statusCode && err.message) {
                    status = err.statusCode;
                    error = err.message;
                } else {
                    status = 400;
                    error = err;
                }
                return res.status(status).send(error);
            }
            res.status(200).send(data.Items);
        });

    router.post("/devices",
        /**
         *
         * @param req
         * @param res
         */
        async function (req, res) {
            try {
                var data = await _scanDevices();
                res.status(200).send(data.Items);

            } catch (err) {
                var error, status;
                console.log(err);
                if (err.statusCode && err.message) {
                    status = err.statusCode;
                    error = err.message;
                } else {
                    status = 400;
                    error = err;
                }
                res.status(status).send(error);
            }
        });
    module.exports = router;
})(module);