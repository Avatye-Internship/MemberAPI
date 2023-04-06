import { NextFunction, Request, Response } from "express";
import productQuery from "../../database/product.query";
import ResponseDto from "../model/ResponseDto";

// 상품 조회
const findProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;

    const result = await productQuery.findProductByCategory(category);
    res.send(new ResponseDto(200, "상품 조회 성공", result));
  } catch (error) {
    console.log(error);
    next();
  }
};

const findProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    const result = await productQuery.findProductById(productId);
  } catch (error) {
    console.log(error);
    next();
  }
};

export default { findProduct, findProductById };
