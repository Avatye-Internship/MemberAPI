const db = require("./pool");
const bcrypt = require("bcrypt");

//회원가입
exports.createLocalUser = async (users, terms) => {
  const {
    email,
    pwd,
    name,
    gender,
    birth,
    nickname,
    profile_img
  } = users;
  const hashed = await bcrypt.hash(pwd, 10);
  const conn = await pool.getConnection(); //트랜잭션 연결
  try{
    await conn.beginTransaction(); // 트랜잭션 적용 시작
    
    const insertId = await db.query("insert into userstbl(email,pwd) value(?,?)",[email, hashed])
    .then((data) => {
      return data[0].insertId;
    });

  await db.query(
    "insert into User_Detailstbl(user_id,name,gender,birth,nickname,profile_img) value(?,?,?,?,?,?)",
    [insertId, name, gender, birth,nickname,profile_img]
  );

  await this.termsIsRequired(terms, insertId);
  await conn.commit() // 커밋

  return insertId;
  }catch(err){
    console.log(err)
    await conn.rollback() // 롤백
    return res.status(500).json(err)
  } finally {
    conn.release() // conn 회수
  }
};

//약관동의 등록 
exports.termsIsRequired = async (terms, userId) => {
  let terms_register_query = `INSERT INTO user_termtbl (term_id,isAgree,user_id) VALUES`;

  //약관동의별 insert 쿼리문 추가
  for (let i = 0; i < terms.length; i++) {
    //약관동의 필수 여부에 따른 에러
    terms_register_query += `('${terms[i].term_id}','${terms[i].isAgree}','${userId}'),`;
  }
  terms_register_query =
    terms_register_query.substring(0, terms_register_query.length - 1) + ";";

  await db.query(terms_register_query);
};

//이메일 조회 
exports.findByEmail = async (email) => {
  return db
    .query("select * from userstbl where email=?", [email])
    .then((data) => data[0][0]);
};

// //이메일 유효성 검사(인증코드 전송) 
// exports.validByEmail = async (userId) => {
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
// exports.findByVerificationCode = async (email) => {
//   const EmailCode = await db.query(
//     "select * from Emailcodestbl join Localtbl on Localtbl.id=Emailcodestbl.local_id where Localtbl.email=? order by Emailcodestbl.created_at DESC",
//     [email]
//   );
//   return EmailCode[0][0];
// };

// //이메일 인증코드 삭제 
// exports.deleteEmailCode = async (email) => {
//   return await db.query(
//     "delete Emailcodestbl from Emailcodestbl join Localtbl on Localtbl.id=Emailcodestbl.local_id where Localtbl.email=?",
//     [email]
//   );
// };

//내 프로필 수정(Userstbl)
// exports.updateUser = async (id, user) => {
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
exports.updateUserDetails = async (id, users) => {
  let user_update_query = `UPDATE User_Detailstbl SET `;

  for (i = 0; i < Object.keys(users).length; i++) {
    user_update_query += `${Object.keys(users)[i]} = '${
      Object.values(users)[i]
    }',`;
  }
  user_update_query = user_update_query.slice(0, -1);
  user_update_query += ` WHERE user_id = '${id}';`;
  //console.log(user_update_query);

  return db.query(user_update_query).then((data) => {
    return data[0];
  });
};
//비밀번호 변경 
exports.updatePwd = async (id, pwd) => {
  const hashed = await bcrypt.hash(pwd, 10);
  return await db
    .query("update Userstbl set pwd=? where user_id=?", [hashed, id])
    .then((data) => {
      return data[0];
    });
};
//회원 탈퇴 
exports.deleteUser = async (id) => {

  return db
    .query("UPDATE Userstbl set active=0, deleted_at=NOW() where user_id=?",[id])
    .then((data) => data[0][0]);
};

exports.findAllUser = async () => {
  const social = await db.query("select * from socialtbl");
  const local = await db.query(
    "select id, user_id, email, created_at, role from localtbl"
  );

  return { social: social[0], local: local[0] };
};

exports.findById = async (id) => {
  return db
    .query("select * from userstbl where user_id=?", [id])
    .then((data) => data[0][0]);
};

// exports.findLocalById = async (id) => {
//   return db
//     .query(
//       "select id, user_id, email, created_at, role,pwd from localtbl where user_id=?",
//       [id]
//     )
//     .then((data) => data[0][0]);
// };

exports.findSocialById = async (id) => {
  return db
    .query("select * from socialtbl where user_id=?", [id])
    .then((data) => data[0][0]);
};

exports.findUserDetailById = async (id) => {
  return db
    .query("select * from user_detailtbl where user_id=?", [id])
    .then((data) => data[0][0]);
};

// user, user_detail, address 모두 조회 후 반환
exports.findUserInfoById = async (id) => {
  return db
    .query(
      "select * from userstbl u inner join user_detailtbl ud on u.id = ud.user_id inner join addresstbl ad on ud.user_id = ad.user_id",
      [id]
    )
    .then((data) => data[0][0]);
};

exports.createSocialUser = async (users) => {
  const { nickname, sns_id, provider } = users;
  const insertId = db
    .query(
      "insert into userstbl(nickname,grade_id,login_type) value(?,1,'SOCIAL')",
      [nickname]
    )
    .then((data) => {
      return data[0].insertId;
    });
  await db.query(
    "insert into Socialtbl(user_id,sns_id, provider) value(?,?,?)",
    [insertId, sns_id, provider]
  );
  await db.query(
    "insert into User_Detailstbl(user_id,name,point,total_order_amount) value(?,?,0,0)",
    [insertId, nickname]
  );
  await this.termsIsRequiredSocial(terms, insertId);
};

exports.termsIsRequiredSocial = async (userId) => {
  let terms_register_query = `INSERT INTO user_termtbl (term_id,isAgree,created_at,user_id,updated_at) VALUES`;
  // 필수 약관만 뽑아오기
  const term_result = await db
    .query("select id from Termstbl where isRequired=true")
    .then((data) => {
      return data[0];
    });
  //약관동의별 insert 쿼리문 추가
  for (let i = 0; i < term_result.length; i++) {
    //약관동의 필수 여부에 따른 에러
    i;
    terms_register_query += `('${terms_result[i].id}','true',NOW(),'${userId}',NOW()),`;
  }
  terms_register_query =
    terms_register_query.substring(0, terms_register_query.length - 1) + ";";
  await db.query(terms_register_query);
};

//
exports.updateUserRole = async (id, role) => {
  return db
    .query("update localtbl set role=? where user_id=?", [role, id])
    .then((data) => {
      return data[0];
    });
};

//
exports.findBySocialId = async (id, provider) => {
  return db
    .query("select * from socialtbl where sns_id=? and provider=?", [
      id,
      login_type,
    ])
    .then((data) => {
      return data[0][0];
    });
};
//
exports.findAllUserAddress = async (id) => {
  return db
    .query("select * from user_addresstbl where user_id=?", [id])
    .then((data) => {
      return data[0][0];
    });
};
//
exports.findUserAddressById = async (address_id, user_id) => {
  return db
    .query("select * from user_addresstbl where address_id=? and user_id=?", [
      address_id,
      user_id,
    ])
    .then((data) => {
      return data[0][0];
    });
};

exports.createUserAddress = async (address_request) => {
  const { zip_code, address, address_detail, request_msg, status } =
    address_request;

  return db
    .query("insert into user_addresstbl values(?,?,?,?,?)", [
      zip_code,
      address,
      address_detail,
      request_msg,
      status,
    ])
    .then((data) => {
      return data[0].insertId;
    });
};
//
exports.updateUserAddress = async (id, address_request) => {
  const { zip_code, address, address_detail, request_msg, status } =
    address_request;

  return db
    .query(
      "update user set zip_code=?, address=?, address_detail=?, request_msg=?, status=? where user_id=?",
      [zip_code, address, address_detail, request_msg, status, id]
    )
    .then((data) => {
      return data[0].updateId;
    });
};
//
exports.deleteUserAddress = async (address_id, user_id) => {
  await db.query("delete from addresstbl where id=? and user_id=?", [
    address_id,
    user_id,
  ]);
};

exports.findAllUserTerms = async (id) => {
  return db
    .query("select * from user_termtbl where user_id=? ", [id])
    .then((data) => data[0]);
};

exports.findByTermId = async (user_id, term_id) => {
  return db
    .query("select * from user_termtbl where user_id=? and term_code=?", [
      user_id,
      term_id,
    ])
    .then((data) => data[0][0]);
};

exports.createTerm = async (term) => {
  const { termName, termContent, isRequired } = term;
  return db
    .query(
      "insert into term(termName, termContent, isRequired) values(?,?,?)",
      [termName, termContent, isRequired]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.createUserTerm = async (id, termName, isAgree) => {
  return db
    .query("insert into userterm(userId, termName, isAgree) values(?,?,?)", [
      id,
      termName,
      isAgree,
    ])
    .then((data) => {
      console.log(data[0].insertId);
      return data[0].insertId;
    });
};

exports.agreeTerm = async (id, isAgree, user_id) => {
  await db.query("update user_termtbl set isAgree=? where userId=? and id=?", [
    isAgree,
    user_id,
    id,
  ]);
};

