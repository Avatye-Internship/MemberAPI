import passport from "passport";
import { userController } from "../controller/user.controller";
import { adminController } from "../controller/admin.controller";
import { Router } from "restify-router";

var userRouter = new Router();

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

userRouter.get("/test", requireAdminAuth, function (req, res, next) {});

userRouter.post("/test", requireAdminAuth, function (req, res, next) {});

/*
    관리자 API
  */
userRouter.post(
  "/admin/login",
  requireAdminSignIn,
  adminController.adminSignIn
);

// 전체 회원 조회 admin
userRouter.get("/admin/users", requireAdminAuth, adminController.getUsers);

// 회원 계정 조회
userRouter.get(
  "/admin/users/account/:id",
  requireAdminAuth,
  adminController.getUserAccount
);

// 회원 정보 상세 조회
userRouter.get(
  "/admin/users/info/:id",
  requireAdminAuth,
  adminController.getUserInfo
);

// 회원 권한 수정
userRouter.patch(
  "/admin/users/role/:id",
  requireAdminAuth,
  adminController.updateUserRole
);

/*
    회원 API
  */
// 회원가입
userRouter.post("/users", userController.signUp);

//이메일 유효성 인증 (회원가입 시)
userRouter.get("/users/check/email", userController.emailValid_signUp);
//이메일 유효성 인증 (비밀번호 찾기 시)
userRouter.get(
  "/users/check/email-pwd",
  userController.emailValid_updatePwdByDB
);

// //이메일 인증코드 확인
// userRouter.get("/users/check/email", userController.emailcodeCheck);
// //이메일 인증코드 확인
// userRouter.delete("/users/check/email", userController.emailcodeDelete);

// //내 프로필 수정(Userstbl)
// userRouter.patch("/users/profile", requireUserAuth, userController.updateMyUsers);

//내 정보 수정(UserDetailstbl)
userRouter.patch("/users", requireUserAuth, userController.updateMyUserDetails);

//비밀번호 변경
userRouter.patch(
  "/users/change/pwd",
  requireUserAuth,
  userController.updatePwdByLogin
);
//비밀번호 찾기
userRouter.patch("/users/find/pwd", userController.updatePwdByDB);

//회원탈퇴
userRouter.post("/users/account", requireUserAuth, userController.deleteUser);

// 로그인
userRouter.post("/users/login/local", requireUserSignIn, userController.signIn);
// 소셜로그인 (카카오 엔드포인트, 콜백)
userRouter.get("/users/login/kakao", requireKakao);
userRouter.get(
  "/users/login/kakao/callback",
  requireKakao,
  userController.socialLogin
);
// 이메일 중복 확인
//userRouter.post("/users/check/email", userController.checkEmail);
// 내 정보 조회
userRouter.get("/users", requireUserAuth, userController.getMyDetail);
// 내 프로필 조회 (이메일, 프로필이미지, 닉네임, 등급, 로그인타입, ..)
userRouter.get("/users/profile", requireUserAuth, userController.getMyProfile);
// 닉네임, 프로필 이미지만 조회
userRouter.get(
  "users/basic-info",
  requireUserAuth,
  userController.getMyBasicInfo
);
// 내 주소 등록
userRouter.post(
  "/users/address",
  requireUserAuth,
  userController.createUserAddress
);
// 내 주소 조회
userRouter.get(
  "/users/address",
  requireUserAuth,
  userController.getMyBasicInfo
);
// 내 주소 수정
userRouter.put(
  "/users/address",
  requireUserAuth,
  userController.updateUserAddress
);
// 내 주소 삭제
userRouter.del(
  "/users/address",
  requireUserAuth,
  userController.deleteUserAddress
);
// 약관 동의 (수정)
userRouter.patch(
  "/users/terms/:id",
  requireUserAuth,
  userController.updateTerm
);
// 약관 전체에 대해 사용자 동의 여부 조회
userRouter.get("/terms", requireUserAuth, userController.getTerms);
// 약관 코드별로 사용자 동의 여부 조회
userRouter.get("/terms/:code", requireUserAuth, userController.getTerm);

export default userRouter;
