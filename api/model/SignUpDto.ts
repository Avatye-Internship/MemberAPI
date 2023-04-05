import { Users } from './Users';
import User_Details from './UserDetails';
import User_Term from './UserTerm';

class SignUpDto {
  email;

  pwd;

  name;

  gender;

  birth;

  nickname;

  profileImg;

  terms;

  constructor(users: Users, userdetail: User_Details, userterm: User_Term[]) {
    this.email = users.email;
    this.pwd = users.pwd;
    this.name = userdetail.name;
    this.gender = userdetail.gender;
    this.birth = userdetail.birth;
    this.nickname = userdetail.nickname;
    this.profileImg = userdetail.profileImg;
    this.terms = userterm;
  }
}

export default SignUpDto;
