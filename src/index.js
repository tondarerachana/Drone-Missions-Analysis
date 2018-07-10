import {authRouter} from "./auth/router";
import {vars} from "./config/common";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import compression from "compression";
import {authenticate} from "./auth/service";
import {planRouter} from "./plan/router";
import {missionRouter} from "./mission/router";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.use(session({
    secret: vars.cookie.SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: vars.cookie.MAX_AGE
    }
}));

// configure a public directory to host static content
app.use(express.static('public'));
app.use("/node_modules", express.static('node_modules'));

app.get(vars.path.API_HEALTH_CHECK, (req, res) => res.send("OK"));  // should come before auth filter

// routes defined
app.use(authRouter);
app.use(planRouter);
app.use(missionRouter);

app.use(authenticate);

app.get(vars.server.ROOT_PATH, (req, res) => res.send("DMA App Server"));
app.listen(vars.server.PORT, () => console.log(`DMA App Server listening on port ${vars.server.PORT}`));
