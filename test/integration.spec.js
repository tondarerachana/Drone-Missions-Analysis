import {after, before, describe} from "mocha";
import {start, stop} from "./integration";

describe('IntegrationTesting', () => {
    let app;

    before(done => {
        app = start(done);
    });

    after(done => {
        stop(app, done);
    });

});