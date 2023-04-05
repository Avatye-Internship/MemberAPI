import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import mysql from 'mysql2';
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

class UserQuery {
  private pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '12345678',
    database: 'shoppingdb',
  });

  private db = this.pool.promise();

  private expiresIn = '3d';

  // 회원가입
  public async createLocalUser(signupDto: SignUpDto):Promise<number> {
    const {
      email, pwd, name, gender, birth, nickname, profileImg, terms,
    } = signupDto;
    const hashed:string = await bcrypt.hash(pwd, 10);
    const conn:any = await this.db.getConnection(); // 트랜잭션 연결
    try {
      await conn.beginTransaction(); // 트랜잭션 적용 시작

      const insertId:number = await this.db
        .query('insert into userstbl(email,pwd) value(?,?)', [email, hashed])
        .then((data:any) => data[0].insertId);

      await this.db.query(
        'insert into User_Detailstbl(user_id,name,gender,birth,nickname,profile_img) value(?,?,?,?,?,?)',
        [insertId, name, gender, birth, nickname, profileImg],
      );

      await this.termsIsRequired(terms, insertId);
      await conn.commit(); // 커밋

      return insertId;
    } catch (err) {
      console.log(err);
      await conn.rollback(); // 롤백

      return -1; // 에러
    } finally {
      conn.release(); // conn 회수
    }
  }

  // 약관동의 등록
  public async termsIsRequired(terms: User_Term[], userId: number): Promise<void> {
    let TERMS_REGISTER_QUERY = 'INSERT INTO user_termtbl (term_id, is_agree, user_id) VALUES';
    // 약관동의별 insert 쿼리문 추가
    for (let i = 0; i < terms.length; i += 1) {
      // 약관동의 필수 여부에 따른 에러
      TERMS_REGISTER_QUERY += `('${terms[i].term_id}', '${terms[i].is_agree}', '${userId}'),`;
    }
    TERMS_REGISTER_QUERY = `${TERMS_REGISTER_QUERY.substring(0, TERMS_REGISTER_QUERY.length - 1)};`;
    await this.db.query(TERMS_REGISTER_QUERY);
  }

  // 이메일 조회

  public async findByEmail(email:string):Promise<Users> {
    return this.db.query('select * from userstbl where email=? and active=1', [email])
      .then((data:any) => data[0][0]);
  }

  // 내 정보 수정(UserDetailstbl)
  public async updateUserDetails(id:string, users:User_Details):Promise<void> {
    let USER_UPDATE_QUERY = 'UPDATE User_Detailstbl SET ';

    // console.log(users.users);
    for (let i = 0; i < Object.keys(users).length; i += 1) {
      USER_UPDATE_QUERY += `${Object.keys(users)[i]} = '${
        Object.values(users)[i]
      }',`;
    }
    USER_UPDATE_QUERY = USER_UPDATE_QUERY.slice(0, -1);
    USER_UPDATE_QUERY += ` WHERE user_id = '${id}';`;
    console.log(USER_UPDATE_QUERY);

    this.db.query(USER_UPDATE_QUERY);
  }

  // 비밀번호 변경
  public async updatePwd(id:string, pwd:string) :Promise<void> {
    const hashed:string = await bcrypt.hash(pwd, 10);
    await this.db.query('update Userstbl set pwd=? where user_id=?', [hashed, id]);
  }

  // 회원 탈퇴
  public async deleteUser(id:string) :Promise<void> {
    await this.db.query('UPDATE Userstbl set active=0, deleted_at=NOW() where user_id=?', [id]);
  }

  public async findAllUser() :Promise<Users> {
    const users:Users = await this.db.query(
      'select id, user_grade_id, login_type, email, created_at, updated_at, active, deleted_at, role from userstbl',
    );

    return users;
  }

  public async findById(id:string) :Promise<Users> {
    return this.db
      .query('select * from userstbl where user_id=?', [id])
      .then((data:any) => data[0][0]);
  }

  // public async .findLocalById = async (id) => {
  //   return this.db
  //     .query(
  //       "select id, user_id, email, created_at, role,pwd from localtbl where user_id=?",
  //       [id]
  //     )
  //     .then((data) => data[0][0]);
  // };

  public async findSocialById(id:number) :Promise<Social> {
    return this.db
      .query('select * from socialtbl where user_id=?', [id])
      .then((data:any) => data[0][0]);
  }

  public async findUserDetailById(id:string) :Promise<User_Details> {
    return this.db
      .query('select * from user_detailstbl where user_id=?', [id])
      .then((data:any) => data[0][0]);
  }

  public async findUserBasicById(id:string) :Promise<UserBasicDto> {
    return this.db
      .query('select nickname, profile_img from user_detailstbl where user_id=?', [id])
      .then((data:any) => data[0][0]);
  }

  // user, user_detail, address 모두 조회 후 반환
  public async findUserInfoById(id:string) : Promise<UserInfoDto> {
    return this.db
      .query(
        'select * from userstbl u inner join user_detailstbl ud on u.id = ud.user_id inner join addresstbl ad on ud.user_id = ad.user_id',
        [id],
      )
      .then((data: any) => data[0][0]);
  }

  public async findUserProfileById(id:string) :Promise<UserProfileDto> {
    // 등급, 이메일, 로그인타입, 포인트, 프로필이미지, 닉네임
    return this.db
      .query(
        'select u.user_id, u.user_grade_id,u.email, u.login_type, ud.point, ud.profile_img, ud.nickname from userstbl u inner join user_detailstbl ud on u.user_id = ud.user_id where u.user_id=?',
        [id],
      )
      .then((data: any) => data[0][0]);
  }

  public async createSocialUser(users:SocialLoginDto): Promise<any> {
    const {
      loginType, email, openId, nickname,
    } = users;

    const conn:any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // users tbl
      const insertId:number = await this.db
        .query(
          'insert into userstbl(login_type, email) value(?, ?)',
          [loginType, email],
        )
        .then((data:any) => data[0].insertId);
      // social tbl
      await this.db.query('insert into Socialtbl(user_id,open_id) value(?,?)', [
        insertId,
        openId,
      ]);

      // user detail
      await this.db.query(
        'insert into User_Detailstbl(user_id,name, nickname) value(?,?,?)',
        [insertId, nickname, nickname],
      );

      // user terms
      await this.termsIsRequiredSocial(insertId);

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

  public async termsIsRequiredSocial(userId:number) :Promise<void> {
    let TERMS_REGISTER_QUERY = 'INSERT INTO user_termtbl (term_id,is_agree,user_id) VALUES';
    // 필수 약관만 뽑아오기
    const termResult:Terms[] = await this.db
      .query('select term_id from Termstbl')
      .then((data:any) => data[0]);
    // 약관동의별 insert 쿼리문 추가
    for (let i = 0; i < termResult.length; i += 1) {
      // 약관동의 필수 여부에 따른 에러
      TERMS_REGISTER_QUERY += `('${termResult[i].termId}','1','${userId}'),`;
    }
    TERMS_REGISTER_QUERY = `${TERMS_REGISTER_QUERY.substring(0, TERMS_REGISTER_QUERY.length - 1)};`;
    await this.db.query(TERMS_REGISTER_QUERY);
  }

  //
  public async updateUserRole(id:string, role:Role):Promise<void> {
    await this.db.query('update userstbl set role=? where user_id=?', [role, id]);
  }

  //

  // public async findBySocialId(id:number, provider) {
  //   return this.db
  //     .query("select * from socialtbl where sns_id=? and provider=?", [
  //       id,
  //       login_type,
  //     ])
  //     .then((data) => {
  //       return data[0][0];
  //     });
  // }
  //
  public async findAllUserAddress(id:string) :Promise<Address[]> {
    return this.db
      .query('select * from addresstbl where user_id=?', [id])
      .then((data:any) => data[0]);
  }

  //
  public async findUserAddressById(address_id:string, user_id:string) :Promise<Address> {
    return this.db
      .query('select * from addresstbl where address_id=? and user_id=?', [
        address_id,
        user_id,
      ])
      .then((data:any) => data[0][0]);
  }

  // 기존 기본배송지 -> 일반 배송지
  public async updateExDefaultAddress(user_id:string):Promise<void> {
    const conn:any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // 기본 배송지 찾기
      const exDefaultId:number = await this.db.query(
        'select address_id from addresstbl where user_id=? and status=1',
        [user_id],
      )
        .then((data:any) => data[0][0].address_id);

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
  public async updateNewDefaultAddress(user_id:string) :Promise<void> {
    const conn:any = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      // 제일 최근 배송지 찾기
      const exDefaultId:number = await this.db.query(
        'select address_id from addresstbl where user_id=? and status=0 order by updated_at desc limit 1',
        [user_id],
      )
        .then((data:any) => data[0][0].address_id);
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

  public async createUserAddress(id:string, address_request:Address) :Promise<number> {
    const {
      zipCode,
      address,
      addressDetail,
      requestMsg,
      receiverName,
      receiverPhone,
    } = address_request;

    return this.db
      .query('insert into addresstbl(user_id,zip_code,address,address_detail,request_msg,receiver_name,receiver_phone) value(?,?,?,?,?,?,?)', [
        id,
        zipCode,
        address,
        addressDetail,
        requestMsg,
        receiverName,
        receiverPhone,
      ])
      .then((data:any) => data[0].insertId);
  }

  //
  public async updateUserAddress(id:string, address_request:Address) :Promise<void> {
    const {
      zipCode, address, addressDetail, requestMsg, status, receiverName, receiverPhone,
    } = address_request;

    await this.db
      .query(
        'update Addresstbl set zip_code=?, address=?, address_detail=?, request_msg=?, status=?,receiver_name=?,receiver_phone=? where address_id=?',
        [zipCode, address, addressDetail, requestMsg, status, receiverName, receiverPhone, id],
      );
  }

  //
  public async deleteUserAddress(address_id:string, user_id:string) :Promise<void> {
    await this.db.query('delete from addresstbl where address_id=? and user_id=?', [
      address_id,
      user_id,
    ]);
  }

  public async findAllUserTerms(id:string) :Promise<User_Term> {
    return this.db
      .query('select * from user_termtbl where user_id=? ', [id])
      .then((data:any) => data[0]);
  }

  public async findByTermId(user_id:string, term_id:string) :Promise<User_Term> {
    return this.db
      .query('select * from user_termtbl where user_id=? and term_id=?', [
        user_id,
        term_id,
      ])
      .then((data: any) => data[0][0]);
  }

  public async createTerm(term:Terms) :Promise<number> {
    const { name, isRequired } = term;
    return this.db
      .query(
        'insert into termstbl(name,is_required) values(?,?)',
        [name, isRequired],
      )
      .then((data:any) => data[0].insertId);
  }

  // public async createUserTerm(id:number, termName:string, isAgree:boolean) {
  //   return this.db
  //     .query("insert into userterm(userId, termName, isAgree) values(?,?,?)", [
  //       id,
  //       termName,
  //       isAgree,
  //     ])
  //     .then((data:any) => {
  //       console.log(data[0].insertId);
  //       return data[0].insertId;
  //     });
  // }

  public async agreeTerm(id:string, is_agree:boolean, user_id:string) :Promise<void> {
    await this.db.query(
      'update user_termtbl set is_agree=? where term_id=? and user_id=?',
      [is_agree, id, user_id],
    );
  }

  // 토큰 만들기
  public async generateJWTToken(id: string, role: Role):Promise<string> {
    const token:string = jwt.sign({ id, role }, 'SECRET', {
      expiresIn: this.expiresIn,
    });
    return token;
  }
}

export default new UserQuery();
