// Load the SDK for JavaScript
import {getAllPlansByUser as accessValidatedPlans} from "../auth/service";
import {vars} from "../config/common";
import each from 'async/each';
import {config, S3} from 'aws-sdk';

config.region = vars.cognito.REGION;

let s3 = new S3();

let getAllPlansByUser = (req, res) => {
    accessValidatedPlans((err, data) => {
        if (err) {
            res.status(404).send(err);
        } else {
            data.Contents.shift();
            each(data.Contents, (content, callback) => {
                setPreSignedURL(content, callback);
            }, (err) => {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    res.status(404).send(err);
                } else {
                    res.status(200).send(data);
                }
            });
        }
    });
};

let setPreSignedURL = (content, callback) => {
    let params = {
        Bucket: vars.s3.plan_bucket.NAME,
        Key: content.Key
    };

    s3.getSignedUrl('getObject', params, (err, url) => {
        content.preSignedURL = url;
        callback();
    });
};

export {getAllPlansByUser};

