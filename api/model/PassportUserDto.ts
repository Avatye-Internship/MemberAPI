import { Users } from './Users';

class PassportUserDto {
  users;

  code;

  msg;

  constructor(users: Users | null, code?: number | null, msg?: string | null) {
    this.users = users;
    this.code = code;
    this.msg = msg;
  }
}

export default PassportUserDto;
