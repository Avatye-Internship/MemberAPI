const db = require("./pool");

exports.findAll = async () => {
  return db.execute("select * from user").then((data) => {
    return data[0];
    console.log(data[0]);
  });
};

exports.findById = async (id) => {
  return db
    .execute("select * from user where id=?", [id])
    .then((data) => data[0][0]);
};

exports.createUser = async (user) => {
  const { userName, pwd, email, profileImgUrl, phone, gender, loginId } = user;
  return db
    .execute(
      "insert into user(userName, pwd, email, profileImgUrl, phone, gender, loginId) values(?,?,?,?,?,?,?)",
      [userName, pwd, email, profileImgUrl, phone, gender, loginId]
    )
    .then((data) => {
      console.log(data[0].insertId);
      return data[0].insertId;
    });
};

exports.updateUser = async (user) => {
  const { userName, roleType, profileImgUrl, phone, gradeId } = user;
  return db
    .execute(
      "update user set userName=?, roleType=?, profileImgUrl=?, phone=?, gradeId=?",
      [userName, roleType, profileImgUrl, phone, gradeId]
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
  return db.execute("select * from user where loginId=?", [id]).then((data) => {
    console.log(data);
    return data[0][0];
  });
};
