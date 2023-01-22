const validator = require("email-validator");

const validateInput = function (req, res, next) {
  if (validator.validate(req.body.email) && req.body.password) {
    next();
  } else {
    res.status(400).send("Please provide an email and password");
  }
};

module.exports = validateInput;
