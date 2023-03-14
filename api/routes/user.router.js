// const restify = require("restify");
// const router = restify.Router();
const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user.controller.js");
const passport = require("passport");
const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { HttpError } = require("restify-errors");

const loginId = body("loginId")
  .notEmpty()
  .withMessage("아이디를 입력해주세요")
  .isString();
const userName = body("userName")
  .notEmpty()
  .withMessage("이름을 입력해주세요")
  .isString()
  .isLength({ min: 2, max: 10 })
  .withMessage("2~10자 이내로 입력해주세요");
const email = body("email")
  .notEmpty()
  .withMessage("이메일을 입력해주세요")
  .isEmail()
  .withMessage("이메일 형식으로 입력해주세요");
const pwd = body("pwd")
  .notEmpty()
  .withMessage("비밀번호를 입력해주세요")
  .isString()
  .isLength({ min: 5, max: 12 })
  .withMessage("5~12자 이내로 입력해주세요");

const requireSignIn = passport.authenticate(
  "local",
  { session: false }
  // failureRedirect: "api/users/test",
);
const requireUserAuth = passport.authenticate("jwt-user", {
  session: false,
});

// 회원모두조회, 약관;
const requireAdminAuth = passport.authenticate("jwt-admin", {
  session: false,
});

const requireKakao = passport.authenticate("kakao", { session: false });

// 전체 회원 조회 admin
userRouter.get("/users", requireAdminAuth, userController.getUsers);
// 회원 id로 조회
userRouter.get("/users/:id", requireUserAuth, userController.getUser);
// 회원가입
userRouter.post(
  "/users",
  [loginId, userName, email, pwd],
  userController.signUp
);
// 회원 정보 업데이트
userRouter.put("/users/:id", requireUserAuth, userController.updateUser);
// 회원 탈퇴
userRouter.delete("/users/:id", requireUserAuth, userController.deleteUser);
// 로그인
userRouter.post("/users/login/local", requireSignIn, userController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
userRouter.get("/users/login/kakao", requireKakao);
userRouter.get(
  "/users/login/kakao/callback",
  requireKakao,
  userController.socialLogin
);
// 아이디 찾기
userRouter.post(
  "/users/find/loginid",
  [email],
  requireUserAuth,
  userController.getIdByEmail
);
// 비번 찾기
userRouter.post(
  "/users/find/pwd",
  requireUserAuth,
  userController.getPwdByLoginId
);
// 아이디 중복 확인
userRouter.post("/users/check/loginid", userController.checkId);
// 이메일 중복 확인
userRouter.post("/users/check/email", userController.checkEmail);
//로그아웃
userRouter.post("/users/logout", userController.logout);

// 전체 약관 내용 조회
userRouter.get("/terms", userController.getTerms);
// 약관 내용 조회
userRouter.get("/terms/:name", userController.getTerm);
// 약관 내용 수정
userRouter.put("/terms/:id", userController.updateTerms);
// 약관 동의 (수정)
userRouter.patch("/terms/:id", userController.updateUserTerms);
// 약관 추가 admin

userRouter.get("/test", function (req, res) {
  return res.send("user router");
});

module.exports = userRouter;
