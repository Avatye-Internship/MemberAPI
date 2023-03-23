const express = require("express");
const router = express.Router();
const passport = require("passport");
const heesooAdminController = require("../controller/heesoo.admin.controller");
const heesooUserController = require("../controller/heesoo.user.controller");

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
router.get("/admin/users", requireAdminAuth, heesooAdminController.getUsers);

// 회원 계정 조회
router.get(
  "/admin/users/account/:id",
  requireAdminAuth,
  heesooAdminController.getUserAccount
);

// 회원 정보 상세 조회
router.get(
  "/admin/users/info/:id",
  requireAdminAuth,
  heesooAdminController.getUserInfo
);

// 회원 권한 수정
router.patch(
  "/admin/users/role/:id",
  requireAdminAuth,
  heesooAdminController.updateUserRole
);

/*
  회원 API
*/
// 로그인
router.post("/users/login/local", requireSignIn, heesooUserController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
router.get("/users/login/kakao", requireKakao);
router.get(
  "/users/login/kakao/callback",
  requireKakao,
  heesooUserController.socialLogin
);
// 이메일 중복 확인
router.post("/users/check/email", heesooUserController.checkEmail);
// 내 정보 조회
router.get("/users", requireUserAuth, heesooUserController.getMyDetail);
// 내 프로필 조회 (닉네임, 등급, 프로필)
router.get(
  "/users/profile",
  requireUserAuth,
  heesooUserController.getMyProfile
);
// 내 계정 정보 조회
router.get(
  "/users/account",
  requireUserAuth,
  heesooUserController.getMyAccount
);
// 내 주소 등록
router.post(
  "/users/address",
  requireUserAuth,
  heesooUserController.createUserAddress
);
// 내 주소 조회
router.get(
  "/users/address",
  requireUserAuth,
  heesooUserController.getUserAddress
);
// 내 주소 수정
router.put(
  "/users/address",
  requireUserAuth,
  heesooUserController.updateUserAddress
);
// 내 주소 삭제
router.delete(
  "/users/address",
  requireUserAuth,
  heesooUserController.deleteUserAddress
);
// 약관 동의 (수정)
router.put(
  "/users/terms/:id",
  requireUserAuth,
  heesooUserController.updateTerm
);

// 약관 전체에 대해 사용자 동의 여부 조회
router.get("/terms", requireUserAuth, heesooUserController.getTerms);
// 약관 코드별로 사용자 동의 여부 조회
router.get("/terms/:code", requireUserAuth, heesooUserController.getTerm);

module.exports = router;
