class Users {
  user_id;

  user_grade_id;

  login_type;

  email;

  pwd;

  created_at;

  updated_at;

  active;

  deleted_at;

  role;

  constructor(
    user_id:string,
    user_grade_id:number,
    login_type:LoginType,
    email:string,
    pwd:string,
    created_at:Date,
    updated_at:Date,
    active:boolean,
    deleted_at:Date,
    role:Role,
  ) {
    this.user_id = user_id;
    this.user_grade_id = user_grade_id;
    this.login_type = login_type;
    this.email = email;
    this.pwd = pwd;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.active = active;
    this.deleted_at = deleted_at;
    this.role = role;
  }
}

export type LoginType = 'LOCAL' | 'KAKAO';
export type Role = 'USER' | 'ADMIN';

interface UpdatePwdByLoginDto {
  oldPwd:string,
  newPwd:string
}

interface UpdatePwdByDBDto {
  email:string,
  newPwd:string
}

export { Users, UpdatePwdByDBDto, UpdatePwdByLoginDto };
