import express from "express";
import {vars} from "../config/common";
import {validateMission} from "./service";

export const missionRouter = express.Router();

missionRouter.post(vars.path.mission.VALIDATE_MISSION, validateMission);

