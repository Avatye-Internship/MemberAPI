const db = require("./pool");

exports.findAll = async () => {
  const social = await db.query("select * from socialtbl");
  const local = await db.query(
    "select id, user_id, email, created_at, role from localtbl"
  );

  return { social: social[0], local: local[0] };
};

exports.findById = async (id) => {
  return db
    .query("select * from userstbl where id=?", [id])
    .then((data) => data[0][0]);
};

exports.findLocalById = async (id) => {
  return db
    .query(
      "select id, user_id, email, created_at, role from localtbl where user_id=?",
      [id]
    )
    .then((data) => data[0][0]);
};

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

exports.findByEmail = async (email) => {
  return db
    .query("select * from localtbl where email=?", [email])
    .then((data) => data[0][0]);
};

exports.createLocalUser = async (user, pwd) => {
  const { userName, email, profileImgUrl, phone, gender, loginId, roleType } =
    user;
  return db
    .query(
      "insert into user(userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType) values(?,?,?,?,?,?,?,?)",
      [userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType]
    )
    .then((data) => {
      return data[0].insertId;
    });
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
  await this.termsIsRequired(terms, insertId);
};

exports.termsIsRequired = async (userId) => {
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
exports.findUserAddress = async (id) => {
  return db
    .query("select * from user_address where user_id=?", [id])
    .then((data) => {
      return data[0][0];
    });
};
//
exports.createUserAddress = async (address_request) => {
  const { zip_code, address, address_detail, request_msg, status } =
    address_request;

  return db
    .query("insert into user_address values(?,?,?,?,?)", [
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
