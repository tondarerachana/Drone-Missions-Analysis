import {vars} from "../config/common";

let validateMission = (req, res) => {

    let imageMetaData = req.body.imageMetaData;
    let planData = req.body.planData;

    let evaluatedWayPoints = evaluateWayPoints(planData, imageMetaData);

    let status = 200;
    if ((evaluatedWayPoints.filter(point => point.status === "fail")).length > 0) {
        status = 501;
    }

    res.status(status).send(evaluatedWayPoints);
};

let calculateDifference = (data1, data2) => {
    return Math.abs(data1 - data2);
};

let calculateGPADifference = (gpa1, gpa2) => {
    return calculateDifference(parseFloat(gpa1), parseFloat(gpa2));
};

let calculateHeadingDifference = (heading1, heading2) => {
    heading1 = evaluateHeading(parseFloat(heading1));
    heading2 = evaluateHeading(parseFloat(heading2));
    return calculateDifference(heading1, heading2);
};

let evaluateHeading = (data) => {
    if (data < 0)
        return 360 + data;
    return data;
};

let calculateAltitudeDifference = (alt1, alt2) => {
    return calculateDifference(alt1, alt2);
};

let degreesToRadians = (degrees) => {
    return degrees * Math.PI / 180;
};

let calculateDistance = (data1, data2) => {
    let lat1 = data1.latitude;
    let lat2 = data2.latitude;

    let lon1 = data1.longitude;
    let lon2 = data2.longitude;

    let R = 6371000; // metres

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
    lon1 = degreesToRadians(lon1);
    lon2 = degreesToRadians(lon2);

    let lat_delta = lat2 - lat1;
    let long_delta = lon2 - lon1;

    let a = Math.sin(lat_delta / 2) * Math.sin(lat_delta / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(long_delta / 2) * Math.sin(long_delta / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

let evaluateWayPoints = (planData, metaData) => {
    let evalWayPoints = [];
    let errorMargins = vars.mission.error_margin;

    for (let i = 0; i < planData.length; i++) {
        let curPlan = planData[i];
        let curMeta = metaData[i];
        let reason = "";

        let d = calculateDistance(curPlan, curMeta);

        if (d > errorMargins.POSITION) {
            reason = "Error in Position";
        }
        else if (calculateAltitudeDifference(curPlan['altitude(m)'], curMeta.altitude) >
            errorMargins.ALTITUDE) {
            reason = "Error in Altitude";
        }
        else if (calculateHeadingDifference(curPlan['heading(deg)'], curMeta.heading) >
            errorMargins.HEADING) {
            reason = "Error in Heading";
        }
        else if (calculateGPADifference(curPlan['gimbalpitchangle'], curMeta.gimbalPitchAngle) >
            errorMargins.GIMBAL_PITCH) {
            reason = "Error in Gimbal pitch angle";
        }

        evalWayPoints.push(reason !== "" ? {
            status: "fail",
            reason: reason
        } : {
            status: "pass"
        });

    }
    return evalWayPoints;
};

export {validateMission};