import { NextFunction, Request, Response } from 'express';
import productQuery from '../../database/product.query';
import PassportUserDto from '../model/PassportUserDto';
import ResponseDto from '../model/ResponseDto';

// 상품 조회
// const findProduct = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { category } = req.query;

//     const result = await productQuery.findProductByCategory(category);
//     res.send(new ResponseDto(200, '상품 조회 성공', result));
//   } catch (error) {
//     console.log(error);
//     next();
//   }
// };

// const findProductById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const productId = req.params.id;

//     const result = await productQuery.findProductById(productId);
//   } catch (error) {
//     console.log(error);
//     next();
//   }
// };

// 참여 상태(status) 수정 및 포인트 적립
const updatePointByStatus = async (req: Request, res: Response, next: NextFunction):
Promise<Response> => {
  try {
    const passportuser:PassportUserDto = req.user;
    const productId : string = req.params.id;

    if (passportuser.users?.user_id == null) {
      // usertbl
      return res.send(
        new ResponseDto(passportuser.code!, passportuser.msg!),
      );
    }
    await productQuery.updatePointByStatus(passportuser.users.user_id, productId);
    return res.send(new ResponseDto(200, '해당 상품을 참여 완료하여 포인트 적립 성공하였습니다.'));
  } catch (error) {
    console.log(error);
    return res.json(error);
    next();
  }
};

export default { updatePointByStatus };
