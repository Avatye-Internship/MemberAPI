const jwt = require("jsonwebtoken");
const {
  findAll,
  findById,
  createUser,
  updateUser,
  findByLoginId,
  findByEmail,
} = require("../../database/user.query");
require("dotenv").config();

exports.getUsers = async () => {
  try {
    let data = await findAll();
    return data;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

exports.getUser = async (id) => {
  try {
    let data = await findById(id);
    return data;
  } catch (err) {
    throw Error(err);
  }
};

// 유저 저장
exports.createUser = async (userReq) => {
  try {
    const insertId = await createUser(userReq);
    return insertId;
  } catch (err) {
    throw Error(err);
  }
};

exports.updateUser = async (userReq) => {
  try {
    const newUser = await updateUser(userReq);
    return newUser;
  } catch (err) {
    throw Error(err);
  }
};

exports.findLoginIdByEmail = async (email) => {
  try {
    let data = await findByEmail(email);
    return data;
  } catch (err) {
    throw Error(err);
  }
};

exports.findByLoginId = async (loginId) => {
  try {
    let data = await findByLoginId(loginId);
    return data;
  } catch (err) {
    throw Error(err);
  }
};

exports.generateJWTToken = async (id, roleType) => {
  const token = jwt.sign({ id, roleType }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
  return token;
};
