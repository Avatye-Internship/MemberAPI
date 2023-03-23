const { agreeTerm, findAll } = require("../../database/heesoo.term.query");
const {
  findUserAddress,
  createUserAddress,
  updateUserAddress,
  findUserDetailById,
  findById,
  findLocalById,
  findSocialById,
  findByEmail,
  deleteUserAddress,
} = require("../../database/heesoo.user.query");
const ResponseDto = require("../model/ResponseDto");

module.exports = {
  // 로컬 로그인
  // local login passport 실행후 user 반환
  signIn: async (req, res, next) => {
    try {
      const user = req.user;
      // 로그인 실패시 에러 반환
      if (user.user_id == null) {
        return res.status(user.code).send(new ResponseDto(user.code, user.msg));
      } else {
        // 로그인 성공시 jwt 토큰 반환
        const jwtToken = await generateJWTToken(user.user_id, user.role);
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      return res.status(500).json(err.message);
    }
  },

  // 소셜 로그인
  socialLogin: async (req, res, next) => {
    try {
      const user = req.user;
      // 로그인 실패시 에러 반환
      if (user.user_id == null) {
        return res.status(user.code).send(new ResponseDto(user.code, user.msg));
      } else {
        // 로그인 성공시 토큰 반환
        const jwtToken = await generateJWTToken(user.user_id, user.role);
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  },

  // email 중복 확인 ()
  checkEmail: async (req, res) => {
    try {
      const emailReq = req.body.email;
      // email 중복 확인
      const isExist = await findByEmail(emailReq);
      if (isExist) {
        return res
          .status(409)
          .send(new ResponseDto(409, "이미 가입된 이메일", emailReq));
      } else {
        return res
          .status(200)
          .send(new ResponseDto(200, "가입 가능한 이메일", emailReq));
      }
    } catch (error) {
      console.log(err);
      return res.status(500).json(error.message);
    }
  },

  // 내 정보 조회 (유저디테일)
  getMyDetail: async (res, req) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
      const user = await findUserDetailById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 상세 정보 조회 성공", user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 내 계정 조회 (로컬, 소셜)
  getMyAccount: async (res, req) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      // 로컬 유저면
      if (req.user.provider == "LOCAL") {
        const localUser = await findLocalById(user_id);
        return res
          .status(200)
          .send(new ResponseDto(200, "내 계정 조회 성공", localUser));
      }

      if (req.user.provider == "SOCIAL") {
        const socialUser = await findSocialById(user_id);
        return res
          .status(200)
          .send(new ResponseDto(200, "내 계정 조회 성공", socialUser));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  updateTerm: async (res, req) => {
    try {
      const { id } = req.params;
      const { isAgree } = req.body;
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      // -> 내 권한 확인된 상태 -> 바로 정보만 반환해주면됨
      await agreeTerm(id, isAgree, user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "내 약관 동의 수정 성공"));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 내 프로필 조회 (유저)
  getMyProfile: async (res, req) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      return res
        .status(200)
        .send(new ResponseDto(200, "내 정보 조회 성공", req.user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 배송지 조회
  getUserAddress: async (req, res) => {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 주소 리스트 반환
      const address = await findUserAddress(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "배송지 리스트 조회", address));
    } catch (error) {
      return res.status(500).json(error.message);
    }
  },

  // 배송지 등록
  createUserAddress: async (req, res) => {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 주소 삽입
      const address = await createUserAddress(req.body);
      return res
        .status(200)
        .send(new ResponseDto(200, "배송지 생성 성공", address));
    } catch (error) {}
  },

  // 배송지 수정
  updateUserAddress: async (req, res) => {
    const user_id = req.user.id;
    const address_id = req.params;
    // 권한 검사
    if (user_id == null) {
      return res
        .status(req.user.code)
        .send(new ResponseDto(req.user.code, req.user.msg));
    }
    const isExist = await getUserAddressById(address_id, user_id);
    if (!isExist) {
      return res
        .status(404)
        .send(new ResponseDto(404, "해당 배송지가 없습니다"));
    }

    // 주소 수정
    await updateUserAddress(id, req.body);
    return res.status(200).send(new ResponseDto(200, "배송지 수정 성공"));
  },

  // 배송지 삭제
  deleteUserAddress: async (req, res) => {
    const address_id = req.params;
    const user_id = req.user.id;
    // 권한 검사
    if (user_id == null) {
      return res
        .status(req.user.code)
        .send(new ResponseDto(req.user.code, req.user.msg));
    }
    const isExist = await getUserAddressById(address_id, user_id);
    if (!isExist) {
      return res
        .status(404)
        .send(new ResponseDto(404, "해당 배송지가 없습니다"));
    }

    await deleteUserAddress(address_id, user_id);
    return res.status(200).send(new ResponseDto(200, "배송지 삭제 성공"));
  },

  // 사용자가 동의/비동의한 약관 전체 조회 (유저인증 필요)
  getTerms: async (req, res) => {
    try {
      const user_id = req.user.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const userTerms = await findAll(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", userTerms));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
  // 사용자가 동의/비동의한 약관 id로 조회 (유저인증 필요)
  getTerm: async (req, res, next) => {
    try {
      const user_id = req.user.id;
      const term_id = req.params.id;
      // 권한 검사
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      const term = await findByCode(user_id, term_id);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
};

// 토큰 만들기
const generateJWTToken = async (id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};
