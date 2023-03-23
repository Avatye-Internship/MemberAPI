const {
  findAll,
  findById,
  findLocalById,
  findSocialById,
  findUserInfoById,
  updateUserRole,
} = require("../../database/heesoo.user.query");

module.exports = {
  // 유저 목록 조회
  getUsers: async (req, res, next) => {
    try {
      const user_id = req.user.id;
      if (user_id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }
      const users = await findAll();
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 목록 조회 성공", users));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 계정 조회
  getUserAccount: async (req, res, next) => {
    const user_id = req.params.id;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }

      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      if (userExist.login_type == "LOCAL") {
        const local = await findLocalById(user_id);
        return res
          .status(200)
          .send(new ResponseDto(200, "유저 조회 성공", local));
      } else {
        const social = await findSocialById(user_id);
        return res
          .status(200)
          .send(new ResponseDto(200, "유저 조회 성공", social));
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 상제 정보 id로 조회
  getUserInfo: async (req, res, next) => {
    const user_id = req.params.id;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg, null));
      }

      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      const user = await findUserInfoById(user_id);
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 상세 정보 조회 성공", user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  // 유저 권한 바꾸기
  updateUserRole: async (req, res, next) => {
    const user_id = req.params.id;
    const { role } = req.body;
    try {
      if (req.user.id == null) {
        return res
          .status(req.user.code)
          .send(new ResponseDto(req.user.code, req.user.msg));
      }

      // 회원 id 존재하는지 검사
      const userExist = await findById(user_id);
      if (!userExist) {
        return res
          .status(404)
          .send(new ResponseDto(404, "해당 회원 id가 존재하지 않습니다"));
      }

      // 회원 있으면 반환
      const user = await updateUserRole(user_id, role);
      return res
        .status(200)
        .send(new ResponseDto(200, "유저 권한 업데이트 성공", user));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
};
