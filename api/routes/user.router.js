// const restify = require("restify");
// const router = restify.Router();
const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user.controller.js");

const passport = require("passport");
const { Router } = require("express");

const requireSignIn = passport.authenticate("local", {
  session: false,
  failureRedirect: "api/users/test",
});
const requireUserAuth = passport.authenticate("jwt-user", {
  session: false,
});

// 회원모두조회, 약관
const requireAdminAuth = passport.authenticate("jwt-admin", {
  session: false,
});

userRouter.get("/", requireAdminAuth, userController.getUsers);
userRouter.get("/:id", requireUserAuth, userController.getUser);
userRouter.post("/", requireUserAuth, userController.signUp);
userRouter.put("/:id", requireUserAuth, userController.updateUser);
userRouter.delete("/:id", requireUserAuth, userController.deleteUser);
userRouter.post(
  "/login/local",
  requireUserAuth,
  requireSignIn,
  userController.signIn
);

userRouter.get("/test", function (req, res) {
  res.send("user router");
});
// router.get("/read", function (req, res) {
//   res.send("user router");
// });
// router.get("/kakao", passport.authenticate("kakao"));

// router.get("/naver", passport.authenticate("naver"));

module.exports = userRouter;
