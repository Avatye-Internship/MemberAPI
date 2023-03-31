import { Response } from "restify";
import userQuery from "../../database/user.query";
import { generateJWTToken } from "./user.controller";
import ResponseDto from "../model/ResponseDto";

export class AdminController {
  // 관리자로컬 로그인
  // local login passport 실행후 user 반환
  public async adminSignIn(req: any, res: Response, next: any): Promise<any> {
    try {
      const admin = req.user;
      // 로그인 실패시 에러 반환
      if (admin.id == null) {
        return res.send(admin.code, new ResponseDto(admin.code, admin.msg));
      } else {
        // 로그인 성공시 jwt 토큰 반환
        const jwtToken = await generateJWTToken(admin.id, admin.role);
        return res.send(
          200,
          new ResponseDto(200, "로그인 성공", { token: jwtToken })
        );
      }
    } catch (err) {
      return res.json(err);
    }
  }
  // 유저 목록 조회
  public async getUsers(req: any, res: Response, next: any) {
    try {
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        // localtbl
        return res.send(admin.code, new ResponseDto(admin.code, admin.msg));
      }
      const users = await userQuery.findAllUser();
      return res.send(200, new ResponseDto(200, "유저 목록 조회 성공", users));
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }

  // 유저 계정 조회
  public async getUserAccount(req: any, res: Response, next: any) {
    try {
      const user_id = req.params.id;

      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        return res.send(admin.code, new ResponseDto(admin.code, admin.msg));
      }

      // 회원 id 존재하는지 검사
      const userExist = await userQuery.findById(user_id); // usertbl
      if (!userExist) {
        return res.send(
          404,
          new ResponseDto(404, "해당 회원 id가 존재하지 않습니다")
        );
      }

      // 회원 있으면 반환
      return res.send(200, new ResponseDto(200, "유저 조회 성공", userExist));
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }

  // 유저 상제 정보 id로 조회
  public async getUserInfo(req: any, res: Response, next: any) {
    try {
      const user_id = req.params.id;
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        return res.send(admin.code, new ResponseDto(admin.code, admin.msg));
      }

      // 회원 id 존재하는지 검사
      const userExist = await userQuery.findById(user_id);
      if (!userExist) {
        return res.send(
          404,
          new ResponseDto(404, "해당 회원 id가 존재하지 않습니다")
        );
      }

      // 회원 있으면 반환
      const user = await userQuery.findUserInfoById(user_id);
      return res.send(
        200,
        new ResponseDto(200, "유저 상세 정보 조회 성공", user)
      );
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }

  // 유저 권한 바꾸기
  public async updateUserRole(req: any, res: Response, next: any) {
    try {
      const user_id = req.params.id;
      const { role } = req.body;
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        // localtbl
        return res.send(admin.code, new ResponseDto(admin.code, admin.msg));
      }
      // 회원 id 존재하는지 검사
      const userExist = await userQuery.findById(user_id);
      if (!userExist) {
        return res.send(
          404,
          new ResponseDto(404, "해당 회원 id가 존재하지 않습니다")
        );
      }

      // 회원 있으면 반환
      const user = await userQuery.updateUserRole(user_id, role); // localtbl
      return res.send(200, new ResponseDto(200, "유저 권한 업데이트 성공"));
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }
}

export const adminController = new AdminController();