import Social from './Social';
import { Users } from './Users';
import User_Details from './UserDetails';

class SocialLoginDto {
  email;

  openId;

  loginType;

  nickname;

  constructor(users: Users, social: Social, userdetail: User_Details) {
    this.email = users.email;
    this.openId = social.open_id;
    this.loginType = users.login_type;
    this.nickname = userdetail.nickname;
  }
}

export default SocialLoginDto;
