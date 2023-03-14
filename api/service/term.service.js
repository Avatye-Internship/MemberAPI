const { findAll, findById } = require("../../database/term.query");

module.exports = {
  getTerms: async (req, res, next) => {
    try {
      const terms = await findAll();
      return terms;
    } catch (error) {
      console.log(error);
    }
  },

  getTerm: async (name) => {
    try {
      const term = await findById(name);
      return term;
    } catch (error) {}
  },
};
