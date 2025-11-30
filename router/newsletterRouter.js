import { Router } from "express";
import * as newsletterController from "../controllers/newsletter.controller.js";

const newsletterRouter = Router();

newsletterRouter.post("/subscribe", newsletterController.subscribe);

export default newsletterRouter;