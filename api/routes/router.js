const express = require("express");
const router = express.Router();
const passport = require("passport");
const adminController = require("../controller/admin.controller");
const userController = require("../controller/user.controller");

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

// 회원 계정 조회
router.get(
  "/admin/users/account/:id",
  requireAdminAuth,
  adminController.getUserAccount
);

// 회원 정보 상세 조회
router.get(
  "/admin/users/info/:id",
  requireAdminAuth,
  adminController.getUserInfo
);

// 회원 권한 수정
router.patch(
  "/admin/users/role/:id",
  requireAdminAuth,
  adminController.updateUserRole
);

/*
  회원 API
*/
// 회원가입 - 경민
router.post("/users", userController.signUp);

//이메일 유효성 인증 - 경민
router.post("/users/check/email", userController.emailValid);
//이메일 인증코드 확인 - 경민
router.get("/users/check/email", userController.emailcodeCheck);
//이메일 인증코드 확인 - 경민
router.delete("/users/check/email", userController.emailcodeDelete);

//내 프로필 수정(Userstbl) -경민(로그인)
router.patch("/users/profile", requireUserAuth, userController.updateMyUsers);
//내 정보 수정(UserDetailstbl) -경민(로그인)
router.patch("/users", requireUserAuth, userController.updatePwdByLogin);

//비밀번호 변경 -경민(로그인)
router.patch(
  "/users/change/pwd",
  requireUserAuth,
  userController.updatePwdByLogin
);
//비밀번호 찾기 - 경민(로그인 없이)
router.patch("/users/find/pwd", userController.updatePwdByDB);

//회원탈퇴 - 경민(로그인)
router.post("/users/account", requireUserAuth, userController.deleteUser);

// 로그인
router.post("/users/login/local", requireSignIn, userController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
router.get("/users/login/kakao", requireKakao);
router.get(
  "/users/login/kakao/callback",
  requireKakao,
  userController.socialLogin
);
// 이메일 중복 확인
router.post("/users/check/email", userController.checkEmail);
// 내 정보 조회
router.get("/users", requireUserAuth, userController.getMyDetail);
// 내 프로필 조회 (닉네임, 등급, 프로필)
router.get("/users/profile", requireUserAuth, userController.getMyProfile);
// 내 계정 정보 조회
router.get("/users/account", requireUserAuth, userController.getMyAccount);
// 내 주소 등록
router.post(
  "/users/address",
  requireUserAuth,
  userController.createUserAddress
);
// 내 주소 조회
router.get("/users/address", requireUserAuth, userController.getUserAddress);
// 내 주소 수정
router.put("/users/address", requireUserAuth, userController.updateUserAddress);
// 내 주소 삭제
router.delete(
  "/users/address",
  requireUserAuth,
  userController.deleteUserAddress
);
// 약관 동의 (수정)
router.put("/users/terms/:id", requireUserAuth, userController.updateTerm);

// 약관 전체에 대해 사용자 동의 여부 조회
router.get("/terms", requireUserAuth, userController.getTerms);
// 약관 코드별로 사용자 동의 여부 조회
router.get("/terms/:code", requireUserAuth, userController.getTerm);

module.exports = router;
