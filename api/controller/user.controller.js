const { validationResult } = require("express-validator");
const passport = require("passport");
const { BadRequestError } = require("restify-errors");
const bcrypt = require("bcrypt");
const ResponseDto = require("../model/ResponseDto.js");
const {
  findUserAddress,
  updateUserAddress,
  createUserAddress,
  findById,
  findUserInfoById,
  findUserDetailById,
  findLocalById,
  findSocialById,
} = require("../../database/heesoo.user.query.js");

module.exports = {
  // // 사용자 주소 조회
  // getUserAddress: async (req, res) => {
  //   try {
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg, null));
  //     }
  //     // 주소 리스트 반환
  //     const address = await findUserAddress(id, req.body);
  //     return res
  //       .status(200)
  //       .send(new ResponseDto(200, "배송지 리스트 조회", address));
  //   } catch (error) {
  //     return res.status(500).json(error.message);
  //   }
  // },
  // createUserAddress: async (req, res) => {
  //   try {
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg, null));
  //     }
  //     // 주소 삽입
  //     const address = await createUserAddress(req.body);
  //     return res
  //       .status(200)
  //       .send(new ResponseDto(200, "배송지 생성 성공", address));
  //   } catch (error) {}
  // },
  // updateUserAddress: async (req, res) => {
  //   // 권한 검사
  //   if (req.user.id == null) {
  //     return res
  //       .status(req.user.code)
  //       .send(new ResponseDto(req.user.code, req.user.msg, null));
  //   }
  //   // 주소 리스트 반환
  //   const updated_id = await updateUserAddress(id, req.body);
  //   return res
  //     .status(200)
  //     .send(new ResponseDto(200, "배송지 수정 성공", { id: updated_id }));
  // },
  // // 로컬 회원가입
  // signUp: async (req, res) => {
  //   try {
  //     const userReq = req.body;
  //     const termReq = req.body.terms;
  //     // 입력 검증
  //     const errors = this.validateReq(req);
  //     if (errors) {
  //       return res.status(400).send(new ResponseDto(400, errors));
  //     }
  //     // id, email 중복 검사
  //     const idExists = await userService.checkId(userReq.loginId);
  //     const emailExists = await userService.checkEmail(userReq.email);
  //     if (!(idExists && emailExists)) {
  //       // 유저 데이터 입력
  //       const insertId = await userService.createUser(userReq);
  //       // 약관 정보 데이터 입력
  //       const insertTerm = await termService.createUserTerm(termReq, insertId);
  //       return res
  //         .status(201)
  //         .send(new ResponseDto(201, "회원가입 성공", { id: insertId }));
  //     } else if (idExists && emailExists) {
  //       return res
  //         .status(409)
  //         .send(new ResponseDto(409, "아이디, 이메일 중복"));
  //     } else if (idExists) {
  //       return res.status(409).send(new ResponseDto(409, "아이디 중복"));
  //     } else if (emailExists) {
  //       return res.status(409).send(new ResponseDto(409, "이메일 중복"));
  //     }
  //   } catch (error) {
  //     return res.status(500).json(error.message);
  //   }
  // },
  // // 로컬 로그인
  // // local login passport 실행후 user 반환
  // signIn: async (req, res, next) => {
  //   try {
  //     // 입력 검증
  //     const errors = this.validateReq(req);
  //     if (errors) {
  //       return res.status(400).send(new ResponseDto(400, errors));
  //     }
  //     // 로그인 실패시 에러 반환
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     } else {
  //       // 로그인 성공시 jwt 토큰 반환
  //       const jwtToken = await userService.generateJWTToken(
  //         req.user.id,
  //         req.user.roleType
  //       );
  //       return res
  //         .status(200)
  //         .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
  //     }
  //   } catch (err) {
  //     return res.status(500).json(err.message);
  //   }
  // },
  // // 소셜 로그인 (약관 동의 어떻게?)
  // socialLogin: async (req, res, next) => {
  //   try {
  //     // 로그인 실패시 에러 반환
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     } else {
  //       // 로그인 성공시 토큰 반환
  //       const jwtToken = await userService.generateJWTToken(
  //         req.user.id,
  //         req.user.roleType
  //       );
  //       return res
  //         .status(200)
  //         .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json(err.message);
  //   }
  // },
  // // email로 id 찾기
  // getIdByEmail: async (req, res) => {
  //   try {
  //     // 입력 검증
  //     const errors = this.validateReq(req);
  //     if (errors) {
  //       return res.status(400).send(new ResponseDto(400, errors));
  //     }
  //     const emailReq = req.body.email;
  //     const isExist = await userService.checkEmail(emailReq);
  //     if (isExist) {
  //       return res
  //         .status(200)
  //         .send(new ResponseDto(200, "아이디 조회 성공", isExist.loginId));
  //     } else {
  //       return res
  //         .status(404)
  //         .send(new ResponseDto(404, "존재하지 않는 이메일", null));
  //     }
  //   } catch (error) {
  //     return res.status(500).json(error.message);
  //   }
  // },
  // // 내 정보 수정
  // updateMyAccount: async (req, res) => {
  //   try {
  //     const userReq = req.body;
  //     // 입력 검증
  //     const errors = this.validateReq(req);
  //     if (errors) {
  //       return res.status(400).send(new ResponseDto(400, errors));
  //     }
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     const newUser = await userService.updateUser(req.user.id, userReq);
  //     return res
  //       .status(200)
  //       .send(new ResponseDto(200, "회원 정보 수정 성공", { id: newUser }));
  //   } catch (error) {
  //     return res.status(500).json(error.message);
  //   }
  // },
  // // 회원 탈퇴
  // deleteUser: async (req, res) => {
  //   try {
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     const isDeleted = await userService.deleteUser(req.user.id);
  //     return res
  //       .status(200)
  //       .send(new ResponseDto(200, "회원 탈퇴 완료", { id: req.user.id }));
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json(err.message);
  //   }
  // },
  // // 사용자 약관 동의
  // updateUserTerms: async (req, res, next) => {
  //   try {
  //     const { name } = req.params;
  //     const isAgree = req.body.isAgree;
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     const userterm = await termService.updateUserTerm(
  //       req.user.id,
  //       name,
  //       isAgree
  //     );
  //     return res.status(200).send(
  //       new ResponseDto(200, "약관 동의 업데이트 성공", {
  //         userId: req.user.id,
  //         termName: name,
  //         isAgree: isAgree,
  //       })
  //     );
  //   } catch (err) {
  //     return res.status(500).json(err.message);
  //   }
  // },
  // // 비밀번호 찾기 ( 로그인한 상태에서 )
  // updatePwdByLogin: async (req, res) => {
  //   try {
  //     const { oldPwd, newPwd } = req.body;
  //     // 권한 검사
  //     if (req.user.id == null) {
  //       return res
  //         .status(req.user.code)
  //         .send(new ResponseDto(req.user.code, req.user.msg));
  //     }
  //     // 해쉬된 비밀번호 비교
  //     const isSame = await bcrypt.compare(oldPwd, req.user.pwd);
  //     // 비번 같으면 변경 가능
  //     if (isSame) {
  //       const updatedPwd = await userService.updatePwd(req.user.id, newPwd);
  //       return res.status(200).send(new ResponseDto(200, "비밀번호 변경 성공"));
  //     } else {
  //       return res
  //         .status(400)
  //         .send(new ResponseDto(400, "현재 비밀번호가 올바르지 않습니다"));
  //     }
  //   } catch (err) {
  //     return res.status(500).json(err.message);
  //   }
  // },
  // //---------------------------------------------------
  // logout: async (req, res, next) => {
  //   try {
  //     req.logout();
  //     return res.status(200).send(users);
  //   } catch (err) {
  //     return res.status(500).send(err);
  //   }
  // },
  // // id로 비밀번호 찾기
  // getPwdByLoginId: async (req, res) => {
  //   if (req.user.id == null) {
  //     return res
  //       .status(req.user.code)
  //       .send(new ResponseDto(req.user.code, req.user.msg, null));
  //   }
  //   const loginId = req.body.loginId;
  //   const hashedpwd = await userService.getPwdByLoginId(loginId);
  //   return res
  //     .status(200)
  //     .send(new ResponseDto(200, "회원 비밀번호 조회 성공", hashedpwd));
  // },
};

exports.validateReq = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.errors;
  }
};

const isAuthorized = async () => {
  if (req.user.id == null) {
    return res
      .status(req.user.code)
      .send(new ResponseDto(req.user.code, req.user.msg, null));
  }

  if (id == req.user.id || req.user.roleType == "roleType") {
    const newUser = await userService.updateUser(id, userReq);
    return res
      .status(200)
      .send(new ResponseDto(200, "회원 정보 수정 성공", id));
  } else {
    return res.status(200).send(new ResponseDto(403, "접근 권한 없음", id));
  }
};
