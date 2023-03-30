import { Router } from "restify-router";
import AdminController from "../controller/admin.controller";
import UserController from "../controller/user.controller";
import "../passport";

const router = new Router();
const requireUserSignIn = passport.authenticate("local-user", {
  session: false,
});

const requireAdminSignIn = passport.authenticate("local-admin", {
  session: false,
});
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
router.post("/admin/login", requireAdminSignIn, AdminController.adminSignIn);
// 전체 회원 조회 admin
router.get("/admin/users", requireAdminAuth, AdminController.getUsers);

// 회원 계정 조회
router.get(
  "/admin/users/account/:id",
  requireAdminAuth,
  AdminController.getUserAccount
);

// 회원 정보 상세 조회
router.get(
  "/admin/users/info/:id",
  requireAdminAuth,
  AdminController.getUserInfo
);

// 회원 권한 수정
router.patch(
  "/admin/users/role/:id",
  requireAdminAuth,
  AdminController.updateUserRole
);

/*
    회원 API
  */
// 회원가입
router.post("/users", UserController.signUp);

//이메일 유효성 인증 (회원가입 시)
router.get("/users/check/email", UserController.emailValid_signUp);
//이메일 유효성 인증 (비밀번호 찾기 시)
router.get("/users/check/email-pwd", UserController.emailValid_updatePwdByDB);

// //이메일 인증코드 확인
// router.get("/users/check/email", UserController.emailcodeCheck);
// //이메일 인증코드 확인
// router.delete("/users/check/email", UserController.emailcodeDelete);

// //내 프로필 수정(Userstbl)
// router.patch("/users/profile", requireUserAuth, UserController.updateMyUsers);

//내 정보 수정(UserDetailstbl)
router.patch("/users", requireUserAuth, UserController.updateMyUserDetails);

//비밀번호 변경
router.patch(
  "/users/change/pwd",
  requireUserAuth,
  UserController.updatePwdByLogin
);
//비밀번호 찾기
router.patch("/users/find/pwd", UserController.updatePwdByDB);

//회원탈퇴
router.post("/users/account", requireUserAuth, UserController.deleteUser);

// 로그인
router.post("/users/login/local", requireUserSignIn, UserController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
router.get("/users/login/kakao", requireKakao);
router.get(
  "/users/login/kakao/callback",
  requireKakao,
  UserController.socialLogin
);
// 이메일 중복 확인
//router.post("/users/check/email", UserController.checkEmail);
// 내 정보 조회
router.get("/users", requireUserAuth, UserController.getMyDetail);
// 내 프로필 조회 (이메일, 프로필이미지, 닉네임, 등급, 로그인타입, ..)
router.get("/users/profile", requireUserAuth, UserController.getMyProfile);
// 닉네임, 프로필 이미지만 조회
router.get("users/basic-info", requireUserAuth, UserController.getMyBasicInfo);
// 내 주소 등록
router.post(
  "/users/address",
  requireUserAuth,
  UserController.createUserAddress
);
// 내 주소 조회
router.get("/users/address", requireUserAuth, UserController.getUserAddress);
// 내 주소 수정
router.put("/users/address", requireUserAuth, UserController.updateUserAddress);
// 내 주소 삭제
router.del(
  "/users/address",
  requireUserAuth,
  UserController.deleteUserAddress
);
// 약관 동의 (수정)
router.patch("/users/terms/:id", requireUserAuth, UserController.updateTerm);
// 약관 전체에 대해 사용자 동의 여부 조회
router.get("/terms", requireUserAuth, UserController.getTerms);
// 약관 코드별로 사용자 동의 여부 조회
router.get("/terms/:code", requireUserAuth, UserController.getTerm);

export { router };
