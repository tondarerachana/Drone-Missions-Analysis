import express from "express";
import {vars} from "../config/common";
import {findCurrentUser, isLoggedIn, login, logout} from "./service";

export const authRouter = express.Router();

authRouter.post(vars.path.auth.LOGIN, login);
authRouter.post(vars.path.auth.LOGOUT, logout);
authRouter.get(vars.path.auth.USER, findCurrentUser);
authRouter.post(vars.path.auth.IS_LOGGED_IN, isLoggedIn);
