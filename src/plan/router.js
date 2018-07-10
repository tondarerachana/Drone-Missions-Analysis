import express from "express";
import {vars} from "../config/common";
import {getAllPlansByUser} from "./service";

export const planRouter = express.Router();

planRouter.get(vars.path.plan.GET_ALL_PLANS_BY_USER, getAllPlansByUser);

