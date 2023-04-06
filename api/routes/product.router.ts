import express from 'express';
import productController from '../controller/product.controller';
import { requireUserAuth } from '../passport/passport';

const productRouter = express.Router();

// productRouter.get('/product', productController.findProduct);

// productRouter.get('/product/:id', productController.findProductById);

// 참여 상태(status) 수정 및 포인트 적립
productRouter.patch('/product/ads/:id/user-status', requireUserAuth, productController.updatePointByStatus);

// 등급 수정

export default productRouter;
