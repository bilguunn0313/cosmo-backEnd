import express from "express";
import { createUserP } from "../controller/createUserP.controller";
import { signInP } from "../controller/signInP.controller";

const userPRouter = express.Router();

userPRouter.post("/createP", createUserP);
userPRouter.post("/loginP", signInP);

export default userPRouter;
