import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import Address from '../api/model/Address';
import Social from '../api/model/Social';
import Terms from '../api/model/Terms';
import { Users, Role } from '../api/model/Users';
import User_Details from '../api/model/UserDetails';
import User_Term from '../api/model/UserTerm';

import SignUpDto from '../api/model/SignUpDto';
import UserBasicDto from '../api/model/UserBasicDto';
import UserInfoDto from '../api/model/UserInfoDto';
import SocialLoginDto from '../api/model/SocialLoginDto';
import UserProfileDto from '../api/model/UserProfileDto';
import pool from './pool';

class UserQuery {
  private pool = pool;

  private db = this.pool.promise();

  private expiresIn = '3d';

  // 등급 수정
  public async updateGradeByPoint(id: string): Promise<void> {
    try {
      const sql = 'call update_user_grade (?)';
      await this.db.query(sql, [id]);
    } catch (error) {
      console.log(error);
    }
  }

  // 회원가입
  public async createLocalUser(signupDto: SignUpDto): Promise<number> {
    const {
      email, pwd, name, gender, birth, nickname, profileImg, terms,
    } = signupDto;
    const hashed: string = await bcrypt.hash(pwd, 10);
    const conn: any = await this.db.getConnection(); // 트랜잭션 연결
    try {
      await conn.beginTransaction(); // 트랜잭션 적용 시작
      // 가입 정보 넣기
      const sqlquery = 'SET @user_id = 0; CALL insert_local_users (?,?,?,?,?,?,?, @user_id);  select @user_id;';

      const results = await this.db.query(sqlquery, [
        email,
        hashed,
        name,
        gender,
        birth,
        nickname,
        profileImg,
      ]);

      const insertId = Object.values(results[0][2][0]).toString();

      // 약관 동의 넣기
      const termquery = 'call insert_user_term (?, ?)';
      const termsJsonStr = JSON.stringify(terms);
      await this.db.query(termquery, [termsJsonStr, insertId]);

      await conn.commit(); // 커밋
      return parseInt(insertId, 10);
    } catch (err) {
      console.log(err);
      await conn.rollback(); // 롤백

      return -1; // 에러
    } finally {
      conn.release(); // conn 회수
    }
  }

  // 이메일 조회
  public async findByEmail(email: string): Promise<Users> {
    // call select_users_by_email
    const sql = 'call select_users_by_email (?)';
    const result: Users = await this.db
      .query(sql, [email])
      .then((data: any) => data[0][0][0]);
    return result;
  }

  //   //내 정보 수정(UserDetailstbl)
  public async updateUserDetails(
    id: string,
    users: User_Details,
  ): Promise<void> {
    const jsonUsers = JSON.stringify(users);
    const sql = 'call update_user_details (?,?)';
    await this.db.query(sql, [jsonUsers, id]);
  }

  // 비밀번호 변경
  public async updatePwd(id: string, pwd: string): Promise<void> {
    const hashed: string = await bcrypt.hash(pwd, 10);
    // call update_users_pwd
    const sql = 'call update_users_pwd (?, ?)';
    await this.db.query(sql, [id, hashed]);

    // await this.db.query("update Userstbl set pwd=? where user_id=?", [hashed, id]);
  }

  // 회원 탈퇴
  public async deleteUser(id: string): Promise<void> {
    // call delete_user_by_id
    const sql = 'call delete_user_by_id (?)';
    await this.db.query(sql, [id]);
  }

  // 회원 모두 조회
  public async findAllUser(): Promise<Users[]> {
    // call select_all_users
    const sql = 'call select_all_users';
    const users: Users[] = await this.db
      .query(sql)
      .then((data: any) => data[0][0]);

    return users;
  }

  // 회원 id로 조회
  public async findById(id: string): Promise<Users> {
    // call select_users_by_id
    const sql = 'call select_users_by_id (?)';
    const user : Users = await this.db.query(sql, [id]).then((data: any) => data[0][0][0]);

    return user;
  }

  // 소셜 객체 찾기
  public async findSocialById(id: number): Promise<Social> {
    // call select_social_by_id
    const sql = 'call select_social_by_id (?)';
    const social : Social = await this.db.query(sql, [id]).then((data: any) => data[0][0][0]);

    return social;
  }

  // call select_user_details_by_id
  public async findUserDetailById(id: string): Promise<User_Details> {
    const sql = 'call select_user_details_by_id (?)';
    const userDetails : User_Details = await this.db.query(sql, [id])
      .then((data: any) => data[0][0][0]);

    return userDetails;
  }

  public async findUserBasicById(id: string): Promise<UserBasicDto> {
    // call select_user_basic_by_id
    const sql = 'call select_user_basic_by_id (?)';
    const userBasicDto : UserBasicDto = await this.db.query(sql, [id])
      .then((data: any) => data[0][0][0]);

    return userBasicDto;
  }

  // user, user_detail, address 모두 조회 후 반환
  public async findUserInfoById(id: string): Promise<UserInfoDto> {
    // call select_user_all_info_by_id
    const sql = 'call select_user_all_info_by_id (?)';
    const userInfoDto : UserInfoDto = await this.db.query(sql, [id])
      .then((data: any) => data[0][0][0]);
    return userInfoDto;
  }

  public async findUserProfileById(id: string): Promise<UserProfileDto> {
    // 등급, 이메일, 로그인타입, 포인트, 프로필이미지, 닉네임
    // call select_users_profile_by_id
    const sql = 'call select_users_profile_by_id (?)';
    const userProfileDto : UserProfileDto = await this.db.query(sql, [id])
      .then((data: any) => data[0][0][0]);
    return userProfileDto;
  }

  public async createSocialUser(users: SocialLoginDto): Promise<any> {
    const conn: any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // 가입 정보 넣기
      const sql = 'SET @user_id = 0; CALL insert_social_users (?,?,?,?, @user_id);  select @user_id;';

      const results = await this.db.query(sql, [
        users.loginType,
        users.email,
        users.openId,
        users.nickname,
      ]);
      // users tbl
      const insertId = Object.values(results[0][2][0]).toString();
      const newSocialUser = await this.findById(insertId.toString());
      await conn.commit();
      return newSocialUser;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      return null;
    } finally {
      conn.release();
    }
  }

  public async updateUserRole(id: string, role: Role): Promise<void> {
    // call update_users_role
    const sql = 'call update_users_role (?, ?)';
    await this.db.query(sql, [id, role]);
  }

  public async findAllUserTerms(id: string): Promise<User_Term> {
    // call select_all_user_terms
    const sql = 'call select_all_user_terms (?)';
    const userTerm : User_Term = await this.db.query(sql, [id]).then((data: any) => data[0][0]);

    return userTerm;
  }

  public async findByTermId(
    user_id: string,
    term_id: string,
  ): Promise<User_Term> {
    // call select_user_terms_by_id
    const sql = 'call select_user_terms_by_id (?,?)';
    const userTerm : User_Term = await this.db
      .query(sql, [user_id, term_id])
      .then((data: any) => data[0][0][0]);

    return userTerm;
  }

  // 선택 약관 동의 수정
  public async agreeTerm(
    id: string,
    is_agree: boolean,
    user_id: string,
  ): Promise<void> {
    // update_user_term
    // const sql = 'call update_user_term';
    await this.db.query(
      'update user_termtbl set is_agree=? where term_id=? and user_id=?',
      [is_agree, id, user_id],
    );
  }

  // ---------------------------- 주소 ------------------------------------------
  public async findAllUserAddress(id: string): Promise<Address[]> {
    // call select_all_address_by_userid
    return this.db
      .query('select * from addresstbl where user_id=?', [id])
      .then((data: any) => data[0]);
  }

  public async findUserAddressById(
    address_id: string,
    user_id: string,
  ): Promise<Address> {
    return this.db
      .query('select * from addresstbl where address_id=? and user_id=?', [
        address_id,
        user_id,
      ])
      .then((data: any) => data[0][0]);
  }

  // 기존 기본배송지 -> 일반 배송지
  public async updateExDefaultAddress(user_id: string): Promise<void> {
    const conn: any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // 기본 배송지 찾기
      const exDefaultId: number = await this.db
        .query(
          'select address_id from addresstbl where user_id=? and status=1',
          [user_id],
        )
        .then((data: any) => data[0][0].address_id);

      // 일반 배송지로 변경
      await this.db.query('update addresstbl set status=0 where address_id=?', [
        exDefaultId,
      ]);
      conn.commit();
    } catch (error) {
      console.log(error);
      await conn.rollback();
    } finally {
      conn.release();
    }
  }

  // 제일 최근 배송지 -> 기본 배송지
  public async updateNewDefaultAddress(user_id: string): Promise<void> {
    const conn: any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // 제일 최근 배송지 찾기
      const exDefaultId: number = await this.db
        .query(
          'select address_id from addresstbl where user_id=? and status=0 order by updated_at desc limit 1',
          [user_id],
        )
        .then((data: any) => data[0][0].address_id);
      // 기본 배송지로 변경
      await this.db.query('update addresstbl set status=1 where address_id=?', [
        exDefaultId,
      ]);
      conn.commit();
    } catch (error) {
      console.log(error);
      await conn.rollback();
    } finally {
      conn.release();
    }
  }

  public async createUserAddress(
    id: string,
    address_request: Address,
  ): Promise<number> {
    const {
      zipCode,
      address,
      addressDetail,
      requestMsg,
      receiverName,
      receiverPhone,
    } = address_request;

    return this.db
      .query(
        'insert into addresstbl(user_id,zip_code,address,address_detail,request_msg,receiver_name,receiver_phone) value(?,?,?,?,?,?,?)',
        [
          id,
          zipCode,
          address,
          addressDetail,
          requestMsg,
          receiverName,
          receiverPhone,
        ],
      )
      .then((data: any) => data[0].insertId);
  }

  //
  public async updateUserAddress(
    id: string,
    address_request: Address,
  ): Promise<void> {
    const {
      zipCode,
      address,
      addressDetail,
      requestMsg,
      status,
      receiverName,
      receiverPhone,
    } = address_request;

    await this.db.query(
      'update Addresstbl set zip_code=?, address=?, address_detail=?, request_msg=?, status=?,receiver_name=?,receiver_phone=? where address_id=?',
      [
        zipCode,
        address,
        addressDetail,
        requestMsg,
        status,
        receiverName,
        receiverPhone,
        id,
      ],
    );
  }

  //
  public async deleteUserAddress(
    address_id: string,
    user_id: string,
  ): Promise<void> {
    await this.db.query(
      'delete from addresstbl where address_id=? and user_id=?',
      [address_id, user_id],
    );
  }

  public async createTerm(term: Terms): Promise<number> {
    const { name, isRequired } = term;
    return this.db
      .query('insert into termstbl(name,is_required) values(?,?)', [
        name,
        isRequired,
      ])
      .then((data: any) => data[0].insertId);
  }

  // 토큰 만들기
  public async generateJWTToken(id: string, role: Role): Promise<string> {
    const token: string = jwt.sign({ id, role }, 'jwtsecret', {
      expiresIn: this.expiresIn,
    });
    return token;
  }
}

export default new UserQuery();
