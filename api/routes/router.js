// const restify = require("restify");
// const router = restify.Router();
const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller.js");
const passport = require("passport");
const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { HttpError } = require("restify-errors");
const adminController = require("../controller/admin.controller.js");
const termController = require("../controller/term.controller.js");

/*
  입력 검증 로직
*/
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
const grade = body("grade")
  .notEmpty()
  .withMessage("수정할 등급 id를 입력해주세요");
const gradeName = body("gradeName")
  .notEmpty()
  .withMessage("등급 이름을 입력해주세요");

/*
  passport
1. 로컬 로그인
2. 유저 접근
3. 관리자 접근 
4. 카카오 로그인
*/
const requireSignIn = passport.authenticate("local", { session: false });

// 사용자만 접근 가능한 api에 달아주는 passport
const requireUserAuth = passport.authenticate("jwt-user", {
  session: false,
});

// 관리자만 접근 가능한 api에 달아주는 passport
const requireAdminAuth = passport.authenticate("jwt-admin", {
  session: false,
});

const requireKakao = passport.authenticate("kakao", { session: false });

/*
  관리자 API
*/
// 전체 회원 조회 admin
router.get("/admin/users", requireAdminAuth, adminController.getUsers);
// 회원 필터링 조회
// router.get("/users/filter", userController.getUsersfilter);

// 회원 id로 조회
router.get("/admin/users/:id", requireAdminAuth, adminController.getUser);
// 회원 정보 수정
router.put(
  "/admin/users/:id",
  requireAdminAuth,
  [userName, email],
  adminController.updateUser
);
// 회원 등급 수정
router.put(
  "/admin/users/:id/grade",
  requireAdminAuth,
  [grade],
  adminController.updateUserGrade
);
// 등급 내용 수정
router.put(
  "/admin/grade/:id",
  requireAdminAuth,
  [gradeName],
  adminController.updateGrade
);

/*
  회원 API
*/
// 회원가입
router.post("/users", [loginId, userName, email, pwd], userController.signUp);
// 회원 탈퇴
router.delete("/users/:id", requireUserAuth, userController.deleteUser);
// 로그인
router.post("/users/login/local", requireSignIn, userController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
router.get("/users/login/kakao", requireKakao);
router.get(
  "/users/login/kakao/callback",
  requireKakao,
  userController.socialLogin
);
// 아이디 찾기
router.post(
  "/users/find/login-id",
  [email],
  requireUserAuth,
  userController.getIdByEmail
);
// 비번 찾기
router.post("/users/find/pwd", requireUserAuth, userController.getPwdByLoginId);
// 아이디 중복 확인
router.post("/users/check/login-id", userController.checkId);
// 이메일 중복 확인
router.post("/users/check/email", userController.checkEmail);
//로그아웃
router.post("/users/logout", userController.logout);
// 약관 동의 (수정)
router.patch("/terms/:id", userController.updateUserTerms);

/*
  약관 API
*/
// 전체 약관 내용 조회
router.get("/terms", termController.getTerms);
// 약관 내용 조회
router.get("/terms/:name", termController.getTerm);
// 약관 추가 admin
router.post("/terms", requireAdminAuth, termController.createTerm);

// 보류
// 약관 내용 수정
// router.put("/terms/:id", requireAdminAuth, termController.updateTerms);

router.get("/test", function (req, res) {
  return res.send("user router");
});

module.exports = router;
