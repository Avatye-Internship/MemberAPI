import Social from "./Social";
import { Users, LoginType } from "./Users";
import User_Details from "./UserDetails";
import e from "express";

class SocialLoginDto {
  email;
  openId;
  loginType;
  nickname;
  constructor(
    email: string,
    openId: string,
    loginType: LoginType,
    nickname: string
  ) {
    this.email = email;
    this.openId = openId;
    this.loginType = loginType;
    this.nickname = nickname;
  }
  // constructor(users: Users, social: Social, userdetail: User_Details) {
  //   this.email = users.email;
  //   this.openId = social.open_id;
  //   this.loginType = users.login_type;
  //   this.nickname = userdetail.nickname;
  // }
}

export default SocialLoginDto;
