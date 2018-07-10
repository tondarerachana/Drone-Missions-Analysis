import {AuthenticationDetails, CognitoUser, CognitoUserPool} from "amazon-cognito-identity-js";
import CognitoExpress from "cognito-express";
import {vars} from "../config/common";

import {CognitoIdentityCredentials, config, S3} from 'aws-sdk';

config.region = vars.cognito.REGION; // Region

const cognitoExpress = new CognitoExpress({
    region: vars.cognito.REGION,
    cognitoUserPoolId: vars.cognito.POOL_ID,
    tokenUse: vars.cognito.TOKEN_TO_USE,
    tokenExpiration: vars.cognito.TOKEN_EXPIRE_TIME //Up to default expiration of 1 hour (3600000 ms)
});

let successPayload = {
    success: true
};

let errorPayload = {
    success: false
};

let errorHandler = (err) => {
    errorPayload.code = err.code;
    errorPayload.statusCode = err.statusCode;
    errorPayload.message = err.message;
};

let setSession = (s, accessToken, refreshToken, username) => {
    const d = new Date();
    s.createdAt = Math.round(d.getTime() / 1000);
    s.accessToken = accessToken;
    s.refreshToken = refreshToken;
    s.user = {
        "username": username
    };
    return s;
};

let login = (req, res) => {
    let body = req.body;
    let username = body.username;
    let password = body.password;

    let authenticationData = {
        Username: username,
        Password: password,
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData);
    let poolData = {
        UserPoolId: vars.cognito.POOL_ID, // Your user pool id here
        ClientId: vars.cognito.CLIENT_ID // Your client id here
    };
    let userPool = new CognitoUserPool(poolData);
    let userData = {
        Username: username,
        Pool: userPool
    };
    let cognitoUser = new CognitoUser(userData);

    if (typeof (req.session.user) !== "undefined" && req.session.user.username === username) {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                req.session.touch(req.sessionID, req.session, (result) => {
                    console.log(result);
                });
                successPayload.token = req.session.accessToken;
                successPayload.message = "Webtoken";

                res.status(200).send(successPayload);
            },
            onFailure: (err) => {
                req.session.destroy(result => {
                    console.log("Session destroy : " + result);
                });
                errorHandler(err);
                res.status(err.statusCode).send(errorPayload);
            }
        })
    } else {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                const accessToken = result.getAccessToken().getJwtToken();
                const refreshToken = result.getRefreshToken().getToken();

                req.session = setSession(req.session, accessToken, refreshToken, username);
                req.session.save();

                successPayload.token = accessToken;
                successPayload.message = "Webtoken";
                successPayload.username = username;

                res.status(200).send(successPayload);
            },

            onFailure: (err) => {
                req.session.destroy(result => {
                    console.log("destroy : " + result);
                });
                errorHandler(err);
                res.status(err.statusCode).send(errorPayload);
            },

            newPasswordRequired: (userAttributes, requiredAttributes) => {
                if (body.hasOwnProperty("username") && body.hasOwnProperty("newPassword")
                    && body.newPassword !== "" && body.newPassword !== null
                    && body.hasOwnProperty("name") && body.name !== "" && body.name !== null) {

                    const newPassword = body.newPassword;
                    const name = body.name;
                    cognitoUser.completeNewPasswordChallenge(newPassword, {"name": name}, {
                        onSuccess: (result) => {
                            res.status(200).send(successPayload);
                        },
                        onFailure: (err) => {
                            errorHandler(err);
                            res.status(err.statusCode).send(errorPayload);
                        }
                    });
                } else {
                    errorPayload.statusCode = 400;
                    errorPayload.message = "Incomplete information";
                    res.status(400).send(errorPayload);
                }
            }
        });
    }
};

let getCurrentUser = () => {
    let data = {
        UserPoolId: vars.cognito.POOL_ID, // Your user pool id here
        ClientId: vars.cognito.CLIENT_ID // Your client id here
    };
    let userPool = new CognitoUserPool(data);
    let cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession((err, result) => {
            if (err) {
                console.log("Error occured while fetching Cognito session: ", err);
                return null;
            }
        });
    }

    return cognitoUser;
};

let getAllPlansByUser = (callback) => {
    let data = {
        UserPoolId: vars.cognito.POOL_ID, // Your user pool id here
        ClientId: vars.cognito.CLIENT_ID // Your client id here
    };
    let userPool = new CognitoUserPool(data);
    let cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession((err, result) => {
            if (result) {
                let identityProvider = vars.cognito.IDENTITY_PROVIDER;
                config.credentials = new CognitoIdentityCredentials({
                    IdentityPoolId: vars.cognito.IDENTITY_POOL_ID,
                    Logins: {
                        [identityProvider]: result.getIdToken().getJwtToken()
                    }
                });
            } else {
                console.log("Error occured while fetching Cognito session: ", err);
                return null;
            }
        });
    }

    //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
    config.credentials.refresh((error) => {
        if (error) {
            console.error(error);
        } else {
            // Instantiate aws sdk service objects now that the credentials have been updated.
            // example: var s3 = new AWS.S3();
            let s3 = new S3();

            let bucketParams = {
                Bucket: vars.s3.plan_bucket.NAME,
                Prefix: config.credentials.identityId + "/"
            };

            // Call S3 to create the bucket
            s3.listObjects(bucketParams, function (err, data) {
                callback(err, data);
            });
        }
    });
};

let findCurrentUser = (req, res) => {
    let currentUser = getCurrentUser();
    if (currentUser != null) {
        res.status(200).send(currentUser);
    } else {
        res.status(403).send("Invalid Request");
    }
};

let logout = (req, res) => {
    let currentUser = getCurrentUser();
    if (currentUser !== null) {
        req.session.destroy();
        currentUser.globalSignOut({
            onSuccess: (result) => {
                successPayload.message = "Logged out successfully";
                res.status(200).send(successPayload);
            },
            onFailure: (err) => {
                errorHandler(err);
                res.status(err.statusCode).send(errorPayload);
            },
        });
    } else {
        errorPayload.statusCode = 405;
        errorPayload.message = "User not found";
        res.status(405).send(errorPayload);
    }
};

let isLoggedIn = (req, res) => {
    let currentUser = getCurrentUser();
    if (currentUser != null) {
        res.status(200).send(currentUser);
    } else {
        res.status(200).send('0');
    }
};

let authenticate = (req, res, next) => {
    let accessTokenFromClient = req.body.token || req.query.token ||
        req.session.accessToken || req.headers['x-access-token'];

    //Fail if token not present in header.
    if (!accessTokenFromClient) {
        errorPayload.statusCode = 401;
        errorPayload.message = "No token found";

        return res.status(401).send(errorPayload);
    }

    cognitoExpress.validate(accessTokenFromClient, (err, response) => {
        if (err) {
            errorPayload.statusCode = 403;
            errorPayload.message = err.message;
            errorPayload.code = err.name;
            return res.status(403).send(errorPayload);
        }

        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    });

};
export {login, logout, authenticate, findCurrentUser, isLoggedIn, getAllPlansByUser};

