const db = require("./pool");

exports.findAll = async () => {
  return db.execute("select * from term").then((data) => {
    return data[0];
    console.log(data[0]);
  });
};

exports.findById = async (name) => {
  return db
    .execute("select * from term where termName=?", [name])
    .then((data) => data[0]);
};

exports.createUserTerm = async (userterm) => {
  const { userId, termcode, isAgree } = userterm;
  return db
    .execute("insert into userterm(userId, termcode, isAgree) values(?,?,?)", [
      userId,
      termcode,
      isAgree,
    ])
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
