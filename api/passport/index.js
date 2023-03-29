const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ExtractJwt } = require("passport-jwt");
const {
  findById,
  findLocalById,
  findByEmail,
  findBySocialId,
  createSocialUser,
} = require("../../database/user.query");
require("dotenv").config();

// 로그인
const passportConfig = {
  usernameField: "email",
  passwordField: "pwd",
};

const UserLoginVerify = async (username, password, done) => {
  try {
    const email = username;
    const pwd = password;

    // 1. 입력된 이메일로 유저 객체 가져오기
    const user = await findByEmail(email); // userstbl
    // 해당 이메일가 없다면 에러
    if (!user) {
      return done(null, { code: 404, msg: "존재하지 않는 이메일" });
    }
    // 2. 일반 회원인지 확인
    if (user.role == "ADMIN") {
      return done(null, {
        code: 400,
        msg: "관리자로 가입된 회원입니다. 관리자 탭에서 다시 로그인해주세요",
      });
    }
    // 3. 로컬로그인으로 요청했는데 로컬이 아니라 다른걸로 가입된 유저라면
    if (user.login_type != "LOCAL") {
      return done(null, {
        code: 400,
        msg: `${user.login_type}로 로그인된 유저입니다. ${user.login_type}로 로그인하세요`,
      });
    }
    // 4. 유저 있으면 해쉬된 비밀번호 비교
    const isSame = await bcrypt.compare(pwd, user.pwd);

    // 비번 같으면 로그인 성공
    if (isSame) {
      return done(null, user);
    } else {
      return done(null, { code: 400, msg: "올바르지 않은 비밀번호" });
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

const AdminLoginVerify = async (username, password, done) => {
  try {
    const email = username;
    const pwd = password;

    // 1. 입력된 이메일로 유저 객체 가져오기
    const user = await findByEmail(email); // userstbl
    // 해당 이메일가 없다면 에러
    if (!user) {
      return done(null, { code: 404, msg: "존재하지 않는 이메일" });
    }
    // 2. 관리자인지 확인
    if (user.role == "USER") {
      return done(null, {
        code: 400,
        msg: "일반 회원으로 가입된 회원입니다. 일반 회원 로그인 탭에서 다시 로그인해주세요",
      });
    }
    // 3. 로컬로그인으로 요청했는데 로컬이 아니라 다른걸로 가입된 유저라면
    if (user.login_type != "LOCAL") {
      return done(null, {
        code: 400,
        msg: `${user.login_type}로 로그인된 유저입니다. ${user.login_type}로 로그인하세요`,
      });
    }
    // 4. 유저 있으면 해쉬된 비밀번호 비교
    const isSame = await bcrypt.compare(pwd, user.pwd);

    // 비번 같으면 로그인 성공
    if (isSame) {
      return done(null, user);
    } else {
      return done(null, { code: 400, msg: "올바르지 않은 비밀번호" });
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

// 유저
const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // request에서 header의 authorization에서 정보를 가져온다
  secretOrKey: process.env.JWT_SECRET, // 암호 키 입력
};

const UserJWTVerify = async (payload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.id); // usertbl
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      return done(null, user);
    }
    // 유저 데이터가 없다면 에러 표시
    return done(null, { code: 401, msg: "인증되지 않은 회원" });
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

const AdminJWTVerify = async (payload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const user = await findById(payload.id);
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      // 관리자만 접근 가능
      if (user.role == "ADMIN") {
        return done(null, user);
      } else {
        return done(null, {
          code: 403,
          msg: "접근 권한 없음",
        });
      }
    } else {
      // 유저 데이터가 없는 경우
      return done(null, {
        code: 401,
        msg: "인증되지 않은 회원",
      });
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

// 카카오
const KakaoConfig = {
  clientID: "7d5afad9f86197e00f3cbfb1c227e14c",
  callbackURL: process.env.KAKAO_CALLBACK_URL,
};

const KakaoVerify = async (accessToken, refreshToken, profile, done) => {
  try {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    // 1. 입력된 이메일로 유저 객체 가져오기
    const exUser = await findByEmail(kakao_account.email);

    // 2. 카카오로그인으로 요청했는데 카카오가 아니라 다른걸로 가입된 유저라면
    if (exUser.login_type != "KAKAO") {
      return done(null, {
        code: 400,
        msg: `${exUser.login_type}로 로그인된 유저입니다. ${exUser.login_type}로 로그인하세요`,
      });
    }
    // 카카오로 가입 이력이 있는 기존 유저라면
    if (exUser) {
      done(null, exUser);
    } else {
      // 새로 가입
      const newSocial = await createSocialUser({
        login_type: "KAKAO",
        email: kakao_account.email,
        open_id: profileJson.id,
        nickname: kakao_account.profile.nickname,
      });
      done(null, newUser);
    }
  } catch (error) {
    console.error(error);
    return done(null, { code: 401, msg: error.message });
  }
};

module.exports = () => {
  passport.use(
    "local-user",
    new LocalStrategy(passportConfig, UserLoginVerify)
  );
  passport.use(
    "local-admin",
    new LocalStrategy(passportConfig, AdminLoginVerify)
  );
  passport.use("jwt-user", new JWTStrategy(JWTConfig, UserJWTVerify));
  passport.use("jwt-admin", new JWTStrategy(JWTConfig, AdminJWTVerify));
  passport.use("kakao", new KakaoStrategy(KakaoConfig, KakaoVerify));
};
