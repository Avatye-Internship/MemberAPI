
class AdminController {
  // 관리자로컬 로그인
  // local login passport 실행후 user 반환
  public async adminSignIn(req: Request, res: Response): Promise<Response>  {
    try {
      const admin = req.user
      // 로그인 실패시 에러 반환
      if (admin.id == null) {
        return res
          .status(admin.code)
          .send(new ResponseDto(admin.code, admin.msg));
      } else {
        // 로그인 성공시 jwt 토큰 반환
        const jwtToken = await generateJWTToken(admin.id, admin.role);
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }
  // 유저 목록 조회
  public async getUsers(req: Request, res: Response) {
    try {
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        // localtbl
        return res
          .status(admin.code)
          .send(new ResponseDto(admin.code, admin.msg));
      }
      const users = await findAllUser();
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 목록 조회 성공", users));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }

  // 유저 계정 조회
  public async getUserAccount(req: Request, res: Response) {
    try {
      const user_id = req.params.id;

      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        return res
          .status(admin.code)
          .send(new ResponseDto(admin.code, admin.msg));
      }

      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id); // usertbl
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 조회 성공", userExist));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }

  // 유저 상제 정보 id로 조회
  public async getUserInfo(req: Request, res: Response) {
    try {
      const user_id = req.params.id;
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        return res
          .status(admin.code)
          .send(new ResponseDto(admin.code, admin.msg));
      }

      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      const user = await findUserInfoById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 상세 정보 조회 성공", user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }

  // 유저 권한 바꾸기
  public async updateUserRole(req: Request, res: Response) {
    try {
      const user_id = req.params.id;
      const { role } = req.body;
      // 권한 검사
      const admin = req.user;
      if (admin.id == null) {
        // localtbl
        return res
          .status(admin.code)
          .send(new ResponseDto(admin.code, admin.msg));
      }
      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      const user = await updateUserRole(user_id, role); // localtbl
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 권한 업데이트 성공"));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
}

export default new AdminController();
