const passport = require("passport");
const userService = require("../service/user.service.js");

module.exports = {
  getUsers: async (req, res, next) => {
    try {
      console.log("-----req-----", req);
      const users = await userService.getUsers();
      return res.status(200).send(users);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getUser: async (req, res, next) => {
    const { id } = req.params;
    try {
      const user = await userService.getUser(id);
      res.status(200).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  signUp: async (req, res) => {
    const userReq = req.body;
    if (
      !userReq.loginId ||
      !userReq.pwd ||
      !userReq.userName ||
      !userReq.email
    ) {
      res.send("모든 항목을 작성해주세요");
    } else {
      // TODO : 유저 있는지 확인 (check id, check pwd)
      const idExists = await userService.checkId(userReq.loginId);
      const emailExists = await userService.checkEmail(userReq.email);

      if (!(idExists && emailExists)) {
        const insertId = await userService.createUser(userReq);
        res.status(201).send({ id: insertId });
      } else if (idExists && emailExists) {
        res.send("아이디, 이메일 중복");
      } else if (idExists) {
        res.send("아이디 중복");
      } else if (emailExists) {
        res.send("이메일 중복");
      }
    }
  },

  signIn: async (req, res, next) => {
    try {
      const jwtToken = await userService.generateJWTToken(
        req.user.id,
        req.user.roleType
      );
      res.status(200).json({ msg: "로그인 성공", token: jwtToken });
    } catch (err) {
      console.log(err);
    }
  },

  updateUser: async (req, res, next) => {
    const { id } = req.params;
    const userReq = req.body;
    try {
      const newUser = await userService.updateUser(id, userReq);
      res.send(newUser);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const isDeleted = await userService.deleteUser(id);
      res.send(isDeleted);
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getIdByEmail: async (req, res) => {
    const email = req.body.email;
    const loginId = await userService.getIdByEmail(email);
    res.send(loginId);
  },

  getPwdByLoginId: async (req, res) => {
    const loginId = req.body.loginId;
    const pwd = await userService.getPwdByLoginId(loginId);
    res.send(pwd);
  },

  checkId: async (req, res) => {
    const loginIdReq = req.body.id;
    const isExist = await userService.checkId(loginIdReq);
    res.send(isExist);
  },

  checkEmail: async (req, res) => {
    const emailReq = req.body.email;
    const isExist = await userService.checkEmail(emailReq);
    res.send(isExist);
  },
};
