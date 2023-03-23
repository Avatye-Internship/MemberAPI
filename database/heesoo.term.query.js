const db = require("./pool");

exports.findAll = async (id) => {
  return db
    .query("select * from user_termtbl where user_id=? ", [id])
    .then((data) => data[0]);
};

exports.findByCode = async (id, code) => {
  return db
    .query("select * from user_termtbl where user_id=? and term_code=?", [
      id,
      code,
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
