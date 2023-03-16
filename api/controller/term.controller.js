const termService = require("../service/term.service");

module.exports = {
  // 약관 전체 조회
  getTerms: async (req, res, next) => {
    try {
      const terms = await termService.getTerms();
      return res
        .status(200)
        .send(new ResponseDto(200, "약관 조회 성공", terms));
    } catch (err) {
      console.log(err);
      throw new BadRequestError();
      return res.status(500).send(err);
    }
  },
  // 약관별 조회
  getTerm: async (req, res, next) => {
    try {
      const { name } = req.params;
      const term = await termService.getTerm(name);
      return res.status(200).send(new ResponseDto(200, "약관 조회 성공", term));
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  // 약관 추가
  createTerm: async (req, res) => {
    try {
      const { termname, termcontent, isRequired } = req.body;
      const newTerm = await termService.createTerm(req.body);
    } catch (error) {}
  },

  updateTerms: async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).send(users);
    } catch (err) {
      return res.status(500).send(err);
    }
  },
};
