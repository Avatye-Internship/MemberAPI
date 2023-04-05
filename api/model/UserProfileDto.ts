import { Users } from './Users';
import User_Details from './UserDetails';

class UserProfileDto {
  id;

  user_grade_id;

  email;

  login_type;

  point;

  profileImg;

  nickname;

  constructor(users:Users, userDetails:User_Details) {
    this.id = users.user_id;
    this.user_grade_id = users.user_grade_id;
    this.email = users.email;
    this.login_type = users.login_type;
    this.point = userDetails.point;
    this.profileImg = userDetails.profileImg;
    this.nickname = userDetails.nickname;
  }
}

export default UserProfileDto;
