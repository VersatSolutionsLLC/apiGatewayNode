/**
 * Created by Sowvik on 27-09-2018.
 */
(function (module) {

    /**
     * @typedef {{NotAuthorizedException:string, message:string,code:string,time:Date,requestId:string,statusCode:number,retryable:boolean, retryDelay:number}} AWSCognitoError
     */
    /**
     * @typedef {{ChallengeParameters:{},AuthenticationResult:{AccessToken:string,ExpiresIn:number, TokenType:string, RefreshToken:string, IdToken:string }}} Tokens
     */

    /**
     * @typedef {{Username:string, UserAttributes:Array<{Name:string,Value:string}>}} User
     */
    "use strict";
    var express = require('express');
    var router = express.Router();
    const clientId = '49obupf637ufda7a5ovqtrra18';
    const userPoolId = 'us-east-1_SzB87t92g';

    var AWS = require("../config/aws");

    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();


    /**
     *
     * @param username
     * @param password
     * @returns {Promise}
     */
    function initiateAuth(username, password) {

        return new Promise((resolve, reject) => {
            "use strict";
            let params = {
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                ClientId: clientId,
                UserPoolId: userPoolId,
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password
                }
            };
            cognitoidentityserviceprovider.adminInitiateAuth(params, function (err, data) {
                "use strict";
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }

            });
        });
    }


    /**
     *
     * @param authToken
     * @returns {Promise}
     */
    function getUser(authToken) {

        return new Promise((resolve, reject) => {
            "use strict";
            cognitoidentityserviceprovider.getUser({
                AccessToken: authToken
            }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }


            });
        })
    }

    /**
     *
     * @param res
     * @private
     */
    function _logout(res) {
        res.cookie('IdToken', "", {maxAge: 1});
        res.cookie('AccessToken', "", {maxAge: 1});
    }

    router.get("/ping", function (req, res) {
        res.cookie('ping', "pong", {maxAge: 3200 * 1000});
        res.status(200).send("pong");
    });

    router.post("/logout", function (req, res) {
        _logout(res);
        res.status(200).send({});
    });


    router.post("/login",
        /**
         *
         * @param req
         * @params req.body
         * @params req.body.username
         * @params req.body.password
         * @params req.cookies
         * @params req.cookies.IdToken
         * @param res
         */
        async function (req, res) {

            var username = req.body.username.trim();
            var password = req.body.password.trim();

            console.log("Username: " + username + " Password: " + password);

            /**
             * @type Tokens
             */
            var data;
            /**
             * @type User
             */
            var user;

            try {
                var accessToekn;
                if (!(accessToekn = req.cookies.AccessToken)) {
                    data = await initiateAuth(username, password);
                    accessToekn = data.AuthenticationResult.AccessToken;
                    res.cookie('IdToken', data.AuthenticationResult.IdToken, {maxAge: data.AuthenticationResult.ExpiresIn * 1000, signed: true});
                    res.cookie('AccessToken', data.AuthenticationResult.AccessToken, {maxAge: data.AuthenticationResult.ExpiresIn * 1000, signed: true});
                }
                console.log("AccessToken: " + accessToekn);
                user = await getUser(accessToekn);
                user.auth = data;
            } catch (
            /**
             * @type AWSCognitoError
             */
                err
                ) {
                var error, status;
                console.error(err);
                if (err.statusCode && err.message) {
                    status = err.statusCode;
                    error = err.message;
                    _logout(res);
                } else {
                    status = 400;
                    error = err;
                }
                return res.status(status).send(error);
            }
            res.status(200).send(user);
        });


    module.exports = router;

})(module);