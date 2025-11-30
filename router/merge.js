import { Router } from "express";
import { checkAuth } from "../middleware/check-auth.js";
import * as mergeController from "../controllers/merge.controller.js";

const mergeRouter = Router();

mergeRouter.post("/merge", checkAuth, mergeController.mergeCart);

export default mergeRouter;