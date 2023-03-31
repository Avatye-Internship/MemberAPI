import userRouter from "./api/routes/router";
import { session } from "passport";
import passportfunc from "./api/passport/passport";
const express = require("express");
const bodyParser = require("body-parser");
// jwt토큰 발급해서 쿠키에 넣어주기 위함
const cookieParser = require("cookie-parser");
const passport = require("passport");

const cookieOption = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};

// 서버 생성
const app = express();
// 미들웨어
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(cookieOption));
passportfunc();
// 라우터
app.use("/api", userRouter);

app.listen(3000, () => {
  console.log("----server on------");
});
