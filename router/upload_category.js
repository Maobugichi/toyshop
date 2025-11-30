import { Router } from "express";
import { createCategory } from "../controllers/upload-category.controller.js";

const uploadCategoryRouter = Router();

uploadCategoryRouter.post('/categories', createCategory);

export default uploadCategoryRouter