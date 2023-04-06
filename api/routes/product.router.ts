import express from "express";
import productController from "../controller/product.controller";

const productRouter = express.Router();

productRouter.get("/product", productController.findProduct);

productRouter.get("/product/:id", productController.findProductById);

export default productRouter;
