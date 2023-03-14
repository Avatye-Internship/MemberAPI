const { validationResult } = require("express-validator");
const passport = require("passport");
const ResponseDto = require("../model/ResponseDto.js");
const termService = require("../service/term.service.js");
const userService = require("../service/user.service.js");

module.exports = {
  // 유저 목록 조회
  getUsers: async (req, res, next) => {
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }
      const users = await userService.getUsers();
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 목록 조회 성공", users));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  // 유저 id로 조회
  getUser: async (req, res, next) => {
    const { id } = req.params;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }
      // 본인이거나 admin이면 조회 가능
      if (id == req.user.id || req.user.roleType == "roleType") {
        return res
          .status(200)
          .send(new ResponseDto(200, "유저 조회 성공", req.user));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  // 로컬 회원가입
  signUp: async (req, res) => {
    const userReq = req.body;

    const errors = validateReq(req);
    if (errors) {
      return res.status(400).send(new ResponseDto(400, errors, null));
    }
    // TODO : 유저 있는지 확인 (check id, check pwd)
    const idExists = await userService.findByLoginId(userReq.loginId);
    const emailExists = await userService.findLoginIdByEmail(userReq.email);

    if (!(idExists && emailExists)) {
      const insertId = await userService.createUser(userReq);
      return res
        .status(201)
        .send(new ResponseDto(201, "회원가입 성공", { id: insertId }));
    } else if (idExists && emailExists) {
      return res
        .status(404)
        .send(new ResponseDto(409, "아이디, 이메일 중복", null));
    } else if (idExists) {
      return res.status(404).send(new ResponseDto(409, "아이디 중복", null));
    } else if (emailExists) {
      return res.status(404).send(new ResponseDto(409, "이메일 중복", null));
    }
  },

  // 로컬 로그인
  signIn: async (req, res, next) => {
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      } else {
        const jwtToken = await userService.generateJWTToken(
          req.user.id,
          req.user.roleType
        );
        return res
          .status(200)
          .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
      }
    } catch (err) {
      console.log(err);
    }
  },

  // id 중복 확인
  checkId: async (req, res) => {
    try {
      const loginIdReq = req.body.id;
      const isExist = await userService.checkId(loginIdReq);
      if (isExist) {
        return res
          .status(409)
          .send(new ResponseDto(409, "이미 가입된 아이디", loginIdReq));
      } else {
        return res
          .status(200)
          .send(new ResponseDto(200, "가입 가능한 아이디", loginIdReq));
      }
    } catch (error) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  // email 중복 확인
  checkEmail: async (req, res) => {
    try {
      const emailReq = req.body.email;
      const isExist = await userService.checkEmail(emailReq);
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
      return res.status(500).send(err);
    }
  },

  // email로 id 찾기
  getIdByEmail: async (req, res) => {
    try {
      const emailReq = req.body.email;
      const isExist = await userService.checkEmail(emailReq);
      if (isExist) {
        return res
          .status(200)
          .send(new ResponseDto(200, "아이디 조회 성공", isExist.loginId));
      } else {
        return res
          .status(404)
          .send(new ResponseDto(404, "존재하지 않는 이메일", null));
      }
    } catch (error) {
      return res.status(500).send(err);
    }
  },

  // 유저 정보 수정
  updateUser: async (req, res, next) => {
    const { id } = req.params;
    const userReq = req.body;
    try {
      // 본인이거나 admin이면 수정 가능
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
        return res.status(403).send(new ResponseDto(403, "접근 권한 없음", id));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ err });
    }
  },

  // 회원 탈퇴
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }
      // 본인이거나 admin이면 삭제 가능
      if (id == req.user.id || req.user.roleType == "roleType") {
        const isDeleted = await userService.deleteUser(id);
        return res
          .status(200)
          .send(new ResponseDto(200, "회원 탈퇴 완료", { id: id }));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  // 소셜 로그인
  socialLogin: async (req, res, next) => {
    try {
      const jwtToken = await userService.generateJWTToken(
        req.user.id,
        req.user.roleType
      );
      return res
        .status(200)
        .send(new ResponseDto(200, "로그인 성공", { token: jwtToken }));
    } catch (err) {
      console.log(err);
    }
  },

  getTerms: async (req, res, next) => {
    try {
      const terms = await termService.getTerms();
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", terms));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  getTerm: async (req, res, next) => {
    try {
      const { name } = req.params;
      const term = await termService.getTerm(name);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },
  //-------------------------------------
  updateTerms: async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  updateUserTerms: async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      req.logout();
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  // id로 비밀번호 찾기
  getPwdByLoginId: async (req, res) => {
    if (req.user.id == null) {
      return res
        .status(req.user.code)
        .send(new ResponseDto(req.user.code, req.user.msg, null));
    }
    const loginId = req.body.loginId;
    const hashedpwd = await userService.getPwdByLoginId(loginId);
    return res
      .status(200)
      .send(new ResponseDto(200, "회원 비밀번호 조회 성공", hashedpwd));
  },
};

const validateReq = (req, res, next) => {
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
