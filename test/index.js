import http from "http";
import assert from "assert";

import '../server';
import {describe, it} from "mocha";

describe('Example Node Server', () => {
    it('should return 200', done => {
        http.get('http://127.0.0.1:5000/healthcheck', res => {
            assert.equal(200, res.statusCode);
            done();
        });
    });
});

