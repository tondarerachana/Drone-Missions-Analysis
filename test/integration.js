import express from "express";

let start = (done, appPort) => {
    const app = express();
    const PORT = appPort || 9000;

    return app.listen(PORT, () => {
        console.log('Server started at port [%s]', PORT);
        done();
    });
};

let stop = (app, done) => {
    app.close();
    done();
};

export {start, stop}
