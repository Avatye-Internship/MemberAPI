const db = require("./pool");

exports.findAll = async () => {
  return db
    .execute(
      "select id, loginId, userName, email, profileImgUrl, phone, gender, roleType, providerType, gradeId, createdAt, updatedAt from user where isDeleted = false"
    )
    .then((data) => {
      return data[0];
    });
};

exports.findById = async (id) => {
  return db
    .execute("select * from user where id=? and isDeleted = false", [id])
    .then((data) => data[0][0]);
};

exports.createLocalUser = async (user, pwd) => {
  const { userName, email, profileImgUrl, phone, gender, loginId, roleType } =
    user;
  return db
    .execute(
      "insert into user(userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType) values(?,?,?,?,?,?,?,?)",
      [userName, pwd, email, profileImgUrl, phone, gender, loginId, roleType]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.createSocialUser = async (userReq) => {
  const { userName, email, loginId, providerType } = userReq;
  return db
    .execute(
      "insert into user(userName, email, loginId, providerType) values(?,?,?,?)",
      [userName, email, loginId, providerType]
    )
    .then((data) => {
      return data[0].insertId;
    });
};

exports.updateUser = async (id, user) => {
  const { userName, email, profileImgUrl, phone, gender } = user;
  return db
    .execute(
      "update user set userName=?, email=?, profileImgUrl=?, phone=?, gender=? where id=?",
      [userName, email, profileImgUrl, phone, gender, id]
    )
    .then((data) => {
      return data[0];
    });
};

exports.deleteUser = async (id) => {
  return db
    .execute("update user set isDeleted=True where id=?", [id])
    .then((data) => {
      return data[0];
    });
};

exports.findByEmail = async (email) => {
  return db
    .execute("select * from user where email=?", [email])
    .then((data) => data[0][0]);
};

exports.findByLoginId = async (id) => {
  console.log(id);
  return db
    .execute("select * from user where loginId=? and isDeleted=false", [id])
    .then((data) => {
      return data[0][0];
    });
};

exports.findBySocialId = async (id, providerType) => {
  return db
    .execute(
      "select * from user where loginId=? and providerType=? and isDeleted=false",
      [id, providerType]
    )
    .then((data) => {
      return data[0][0];
    });
};
