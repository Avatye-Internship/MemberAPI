import express from 'express';
import productController from '../controller/product.controller';
import { requireUserAuth } from '../passport/passport';

const productRouter = express.Router();

// 카테고리별 상품 조회
productRouter.get('/product', requireUserAuth, productController.findProduct);

// 상품 id별 조회
productRouter.get('/product/ads/:id', requireUserAuth, productController.findProductById);

// 참여 상태(status) 수정 및 포인트 적립
productRouter.patch('/product/ads/:id/user-status', requireUserAuth, productController.updatePointByStatus);

export default productRouter;
