import { Router } from "express";
import { createCategory } from "../controllers/categoryController.js";

const uploadCategoryRouter = Router();

uploadCategoryRouter.post('/categories', createCategory);

export default uploadCategoryRouter