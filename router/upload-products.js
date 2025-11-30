import { Router } from "express";
import { getAllProducts, createProduct } from "../controllers/upload-products.controllers.js";

const productRouter = Router();

productRouter.get('/', getAllProducts);
productRouter.post('/upload-product', createProduct);

export default productRouter;