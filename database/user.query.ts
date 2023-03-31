import bcrypt from "bcrypt";
import Address from "../api/model/Address";
import { SignUpDto, SocialLoginDto } from "../api/model/ReqDto";
import { UserBasicDto, UserInfoDto, UserProfileDto } from "../api/model/ResDto";
import Social from "../api/model/Social";
import Terms from "../api/model/Terms";
import Users, { Role } from "../api/model/Users";
import User_Details from "../api/model/User_Details";
import User_Term from "../api/model/User_Term";

import db from "./pool";

class UserQuery {
  //회원가입
  public async createLocalUser(signupDto: SignUpDto):Promise<number>{
    const { email, pwd, name, gender, birth, nickname, profile_img,terms } = signupDto;
    const hashed:string = await bcrypt.hash(pwd, 10);
    const conn:any = await db.getConnection(); //트랜잭션 연결
    try {
      await conn.beginTransaction(); // 트랜잭션 적용 시작

      const insertId:number = await db
        .query("insert into userstbl(email,pwd) value(?,?)", [email, hashed])
        .then((data:any) => {
          return data[0].insertId;
        });

      await db.query(
        "insert into User_Detailstbl(user_id,name,gender,birth,nickname,profile_img) value(?,?,?,?,?,?)",
        [insertId, name, gender, birth, nickname, profile_img]
      );

      await this.termsIsRequired(terms, insertId);
      await conn.commit(); // 커밋

      return insertId;
    } catch (err) {
      console.log(err);
      await conn.rollback(); // 롤백

      return -1; //에러
    } finally {
      conn.release(); // conn 회수
    }
  }

  //약관동의 등록
  public async termsIsRequired(terms:User_Term[], userId:number):Promise<void>{
    let terms_register_query = `INSERT INTO user_termtbl (term_id,isAgree,user_id) VALUES`;

    //약관동의별 insert 쿼리문 추가
    for (let i = 0; i < terms.length; i++) {
      //약관동의 필수 여부에 따른 에러
      terms_register_query += `('${terms[i].term_id}','${terms[i].is_agree}','${userId}'),`;
    }
    terms_register_query =
      terms_register_query.substring(0, terms_register_query.length - 1) + ";";

    await db.query(terms_register_query);
  }

  //이메일 조회

  public async findByEmail(email:string):Promise<Users> {
    return await db.query("select * from userstbl where email=? and active=1", [email])
      .then((data:any) => data[0][0]);
  }

  // //이메일 유효성 검사(인증코드 전송)
  // public async .validByEmail = async (userId) => {
  //   //이메일 인증코드 db에 저장
  //   const verificationCode = generateVerificationCode(); //인증코드 생성
  //   const insertId = await db
  //     .query("insert into Emailcodestbl(user_id,verification_code) value(?,?)", [
  //       userId,
  //       verificationCode,
  //     ])
  //     .then((data) => {
  //       return data[0].insertId;
  //     });
  //   return { insertId, verificationCode };
  // };

  //이메일 인증코드 확인
  // public async .findByVerificationCode = async (email) => {
  //   const EmailCode = await db.query(
  //     "select * from Emailcodestbl join Localtbl on Localtbl.id=Emailcodestbl.local_id where Localtbl.email=? order by Emailcodestbl.created_at DESC",
  //     [email]
  //   );
  //   return EmailCode[0][0];
  // };

  // //이메일 인증코드 삭제
  // public async .deleteEmailCode = async (email) => {
  //   return await db.query(
  //     "delete Emailcodestbl from Emailcodestbl join Localtbl on Localtbl.id=Emailcodestbl.local_id where Localtbl.email=?",
  //     [email]
  //   );
  // };

  //내 프로필 수정(Userstbl)
  // public async .updateUser = async (id, user) => {
  //   const { nickname, profile_img } = user;
  //   return db
  //     .query("update userstbl set nickname=?, profile_img=? where id=?", [
  //       nickname,
  //       profile_img,
  //       id,
  //     ])
  //     .then((data) => {
  //       return data[0];
  //     });
  // };

  //내 정보 수정(UserDetailstbl)
  public async updateUserDetails(id:number, users:User_Details):Promise<void>{
    let user_update_query = `UPDATE User_Detailstbl SET `;

    for (let i = 0; i < Object.keys(users).length; i++) {
      user_update_query += `${Object.keys(users)[i]} = '${
        Object.values(users)[i]
      }',`;
    }
    user_update_query = user_update_query.slice(0, -1);
    user_update_query += ` WHERE user_id = '${id}';`;
    //console.log(user_update_query);
    
    db.query(user_update_query);
  };
  
  //비밀번호 변경
  public async updatePwd(id:number, pwd:string) :Promise<void>{
    const hashed = await bcrypt.hash(pwd, 10);
    await db.query("update Userstbl set pwd=? where user_id=?", [hashed, id]);
  }

  //회원 탈퇴
  public async deleteUser(id:number) :Promise<void>{
    await db.query("UPDATE Userstbl set active=0, deleted_at=NOW() where user_id=?", [id]);
  }

  public async findAllUser() :Promise<Users>{
    const users = await db.query(
      "select id, user_grade_id, login_type, email, created_at, updated_at, active, deleted_at, role from userstbl"
    );

    return users;
  }

  public async findById(id:number) :Promise<Users>{
    return db
      .query("select * from userstbl where user_id=?", [id])
      .then((data:any) => data[0][0]);
  }

  // public async .findLocalById = async (id) => {
  //   return db
  //     .query(
  //       "select id, user_id, email, created_at, role,pwd from localtbl where user_id=?",
  //       [id]
  //     )
  //     .then((data) => data[0][0]);
  // };

  public async findSocialById(id:number) :Promise<Social>{
    return db
      .query("select * from socialtbl where user_id=?", [id])
      .then((data:any) => data[0][0]);
  }

  public async findUserDetailById(id:number) :Promise<User_Details>{
    return db
      .query("select * from user_detailstbl where user_id=?", [id])
      .then((data:any) => data[0][0]);
  }

  public async findUserBasicById(id:number) :Promise<UserBasicDto>{
    return db
      .query("select nickname, profile_img from userstbl where id=?", [id])
      .then((data:any) => data[0][0]);
  }

  // user, user_detail, address 모두 조회 후 반환
  public async findUserInfoById(id:number) : Promise<UserInfoDto>{
    return db
      .query(
        "select * from userstbl u inner join user_detailstbl ud on u.id = ud.user_id inner join addresstbl ad on ud.user_id = ad.user_id",
        [id]
      )
      .then((data:any) => data[0][0]);
  }

  public async findUserProfileById(id:number) :Promise<UserProfileDto>{
    // 등급, 이메일, 로그인타입, 포인트, 프로필이미지, 닉네임
    return db
      .query(
        "select u.id, u.user_grade_id, u.email, u.login_type, ud.point, ud.profile_img, ud.nickname from userstbl u inner join user_detailtbl ud on u.id = ud.user_id",
        [id]
      )
      .then((data:any) => data[0][0]);
  }

  public async createSocialUser(users:SocialLoginDto): Promise<number> {
    const { login_type, email, open_id, nickname } = users;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // users tbl
      const insertId = await db
        .query(
          "insert into userstbl(user_grade_id, login_type, email) value(3,?, ?)",
          [login_type, email]
        )
        .then((data:any) => {
          return data[0].insertId;
        });
      // social tbl
      await db.query("insert into Socialtbl(user_id,open_id) value(?,?)", [
        insertId,
        open_id,
      ]);

      // user detail
      await db.query(
        "insert into User_Detailstbl(user_id,name,point,total_order_amount, nickname) value(?,?,0,0,?)",
        [insertId, nickname, nickname]
      );

      // user terms
      await this.termsIsRequiredSocial(insertId);

      await conn.commit();
      return insertId;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      return -1;
    } finally {
      conn.release();
    }
  }

  public async termsIsRequiredSocial(userId:number) :Promise<void>{
    let terms_register_query = `INSERT INTO user_termtbl (term_id,isAgree,created_at,user_id,updated_at) VALUES`;
    // 필수 약관만 뽑아오기
    const term_result:Terms[] = await db
      .query("select id from Termstbl where isRequired=true")
      .then((data:any) => {
        return data[0];
      });
    //약관동의별 insert 쿼리문 추가
    for (let i = 0; i < term_result.length; i++) {
      //약관동의 필수 여부에 따른 에러
      terms_register_query += `('${term_result[i].term_id}','true',NOW(),'${userId}',NOW()),`;
    }
    terms_register_query =
      terms_register_query.substring(0, terms_register_query.length - 1) + ";";
    await db.query(terms_register_query);
  }

  //
  public async updateUserRole(id:number, role:Role):Promise<void> {
    await db.query("update userstbl set role=? where id=?", [role, id])
  }

  //

  // public async findBySocialId(id:number, provider) {
  //   return db
  //     .query("select * from socialtbl where sns_id=? and provider=?", [
  //       id,
  //       login_type,
  //     ])
  //     .then((data) => {
  //       return data[0][0];
  //     });
  // }
  //
  public async findAllUserAddress(id:number) :Promise<Address[]>{
    return db
      .query("select * from addresstbl where user_id=?", [id])
      .then((data:any) => {
        return data[0][0];
      });
  }
  //
  public async findUserAddressById(address_id:number, user_id:number) :Promise<Address>{
    return db
      .query("select * from addresstbl where address_id=? and user_id=?", [
        address_id,
        user_id,
      ])
      .then((data:any) => {
        return data[0][0];
      });
  }

  // 기존 기본배송지 -> 일반 배송지
  public async updateExDefaultAddress(user_id:number):Promise<void> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // 기본 배송지 찾기
      const exDefaultId = await db.query(
        "select address_id from addresstbl where user_id=? and status=1",
        [user_id]
      );
      // 일반 배송지로 변경
      await db.query("update addresstbl set status=0 where address_id=?", [
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
  public async updateNewDefaultAddress(user_id:number) :Promise<void>{
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // 제일 최근 배송지 찾기
      const exDefaultId = await db.query(
        "select address_id from addresstbl where user_id=? and status=0 order by updated_at desc limit 1",
        [user_id]
      );
      // 기본 배송지로 변경
      await db.query("update addresstbl set status=1 where address_id=?", [
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

  public async createUserAddress(address_request:Address) :Promise<number>{
    const {
      zip_code,
      address,
      address_detail,
      request_msg,
      status,
      receiver_name,
      receiver_phone,
    } = address_request;

    return db
      .query("insert into addresstbl values(?,?,?,?,?)", [
        zip_code,
        address,
        address_detail,
        request_msg,
        status,
        receiver_name,
        receiver_phone,
      ])
      .then((data:any) => {
        return data[0].insertId;
      });
  }
  //
  public async updateUserAddress(id:number, address_request:Address) :Promise<void>{
    const { zip_code, address, address_detail, request_msg, status } =
      address_request;

    await db
      .query(
        "update userstbl set zip_code=?, address=?, address_detail=?, request_msg=?, status=? where user_id=?",
        [zip_code, address, address_detail, request_msg, status, id]
      )
  }
  //
  public async deleteUserAddress(address_id:number, user_id:number) :Promise<void>{
    await db.query("delete from addresstbl where id=? and user_id=?", [
      address_id,
      user_id,
    ]);
  }

  public async findAllUserTerms(id:number) :Promise<User_Details>{
    return db
      .query("select * from user_termtbl where user_id=? ", [id])
      .then((data:any) => data[0]);
  }

  public async findByTermId(user_id:number, term_id:number) :Promise<User_Details>{
    return db
      .query("select * from user_termtbl where user_id=? and term_code=?", [
        user_id,
        term_id,
      ])
      .then((data:any) => data[0][0]);
  }

  public async createTerm(term:Terms) :Promise<number>{
    const { name, is_required } = term;
    return db
      .query(
        "insert into termstbl(name,is_required) values(?,?)",
        [name,is_required]
      )
      .then((data:any) => {
        return data[0].insertId;
      });
  }

  // public async createUserTerm(id:number, termName:string, isAgree:boolean) {
  //   return db
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

  public async agreeTerm(id:number, isAgree:boolean, user_id:number) :Promise<void>{
    await db.query(
      "update user_termtbl set is_agree=? where term_id=? and user_id=?",
      [isAgree, id, user_id]
    );
  }
}

export default new UserQuery();
