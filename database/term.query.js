const db = require("./pool");

exports.findAll = async () => {
  return db.execute("select * from term").then((data) => {
    return data[0];
    console.log(data[0]);
  });
};

exports.findById = async (id) => {
  return db
    .execute("select * from term where id=?", [id])
    .then((data) => data[0][0]);
};

exports.createTerm = async (user) => {
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

exports.agreeTerm = async (isAgree) => {
  return db.execute("update userterm set isAgree=?", [isAgree]).then((data) => {
    console.log(data[0]);
    return data[0];
  });
};
