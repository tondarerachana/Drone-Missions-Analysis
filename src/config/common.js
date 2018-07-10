import {localVars} from "./local";
import {prodVars} from "./prod";

const envVars = process.env.NODE_ENV === "DEV" ? localVars : prodVars;

const config = {
    "path": {
        "API_HEALTH_CHECK": "/healthCheck",
        "auth": {
            "LOGIN": "/login",
            "LOGOUT": "/logout",
            "USER": "/user",
            "IS_LOGGED_IN": "/isLoggedIn"
        },
        "plan": {
            "GET_ALL_PLANS_BY_USER": "/user/:userID/plan"
        },
        "mission": {
            "VALIDATE_MISSION": "/user/:userID/mission"
        },
        "maps": {
            "INITIALIZE_MAPS": "/user/:userID/maps"
        }
    },
    "server": {
        "ENV": process.env.NODE_ENV,
        "PORT": process.env.DMA_APP_SERVER_PORT,
        "ROOT_PATH": "/",
        "PROTOCOL": "http://"
    },
    "cookie": {
        "SECRET": process.env.DMA_APP_SECRET,
        "MAX_AGE": eval(process.env.DMA_COOKIE_MAX_AGE)
    },
    "cognito": {
        "REGION": process.env.DMA_APP_COGNITO_REGION,
        "POOL_ID": process.env.DMA_APP_COGNITO_POOL_ID,
        "CLIENT_ID": process.env.DMA_APP_COGNITO_APP_CLIENT_ID,
        "TOKEN_TO_USE": "access",   //Possible Values: access | id
        "TOKEN_EXPIRE_TIME": eval(process.env.DMA_COOKIE_MAX_AGE),
        "IDENTITY_POOL_ID": process.env.DMA_APP_COGNITO_IDENTITY_POOL_ID,
        "IDENTITY_PROVIDER": process.env.DMA_APP_COGNITO_IDENTITY_PROVIDER
    },
    "router": {
        "AUTH": "/auth",
    },
    "mission": {
        "error_margin": {
            "POSITION": 0.05,  //RADIANS
            "ALTITUDE": 10, //METRES
            "HEADING": 10,  //DEGREE
            "GIMBAL_PITCH": 10  //DEGREE
        }
    },
    "s3": {
        "plan_bucket": {
            "NAME": "drone-mission-plans"
        }
    }

};

export {config as vars};