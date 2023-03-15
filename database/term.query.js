const db = require("./pool");

exports.findAll = async () => {
  return db.execute("select * from term").then((data) => {
    return data[0];
    console.log(data[0]);
  });
};

exports.findById = async (name) => {
  return db
    .execute("select * from term where termname=?", [name])
    .then((data) => data[0]);
};

exports.createUserTerm = async (id, termName, isAgree) => {
  return db
    .execute("insert into userterm(userId, termname, isAgree) values(?,?,?)", [
      id,
      termName,
      isAgree,
    ])
    .then((data) => {
      console.log(data[0].insertId);
      return data[0].insertId;
    });
};

exports.agreeTerm = async (id, name, isAgree) => {
  return db
    .execute("update userterm set isAgree=? where userId=? and termname=?", [
      isAgree,
      id,
      name,
    ])
    .then((data) => {
      console.log(data[0]);
      return data[0];
    });
};
