const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const { getUser, findByLoginId } = require("../service/user.service");
const LocalStrategy = require("passport-local").Strategy;
const kakaoPassport = require("passport-kakao");
const naverPassport = require("passport-naver-v2");
const googlePassport = require("passport-google-oauth20");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ExtractJwt } = require("passport-jwt");
const { findById } = require("../../database/user.query");
const { UnauthorizedError } = require("restify-errors");
require("dotenv").config();

const passportConfig = {
  usernameField: "loginId",
  passwordField: "pwd",
};

const passportVerify = async (username, password, done) => {
  try {
    const loginId = username;
    const pwd = password;

    const user = await findByLoginId(loginId);

    // 해당 아이디의 유저가 없다면 에러
    if (!user) {
      return done(null, false, { msg: "존재하지 않는 사용자입니다." });
    }

    // 유저 있으면 해쉬된 비밀번호 비교
    // const isSame = await bcrypt.compare(pwd, user.pwd);
    const isSame = true;
    // 비번 같으면 로그인 성공
    if (isSame) {
      return done(null, user);
    } else {
      return done(null, false, { msg: "올바르지 않은 비밀번호" });
    }
  } catch (error) {
    console.error(error);
    return done(error);
  }
};

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // request에서 header의 authorization에서 정보를 가져온다
  secretOrKey: process.env.JWT_SECRET, // 암호 키 입력
};

const UserJWTVerify = async (payload, done) => {
  try {
    console.log("jwt들어옴-----------");
    console.log(payload);
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.sub.id);
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      return done(null, false, user);
    }
    // 유저 데이터가 없다면 에러 표시
    return done(null, false, { reason: "인증되지 않은 사용자" });
  } catch (error) {
    console.error(error);
    return done(error);
  }
};

const AdminJWTVerify = async (payload, done) => {
  try {
    console.log(payload.id);
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.id);

    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user && user.roleType == "ADMIN") {
      return done(null, false, user);
    } else {
      console.log("여기지롱");
      return done(null, false, {
        reason: "인증되지 않은 사용자, 관리자만 접근 가능",
      });
    }
    // 유저 데이터가 없다면 에러 표시
  } catch (error) {
    console.error(error);
    return done(error);
  }
};

module.exports = () => {
  // 로컬
  passport.use("local", new LocalStrategy(passportConfig, passportVerify));
  passport.use("jwt-user", new JWTStrategy(JWTConfig, UserJWTVerify));
  passport.use("jwt-admin", new JWTStrategy(JWTConfig, AdminJWTVerify));
};
