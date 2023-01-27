const validator = require("email-validator");
const jwtUtil = require("../util/jwtUtil");

// check if email and password are valid
const validateInput = function (req, res, next) {
  if (validator.validate(req.body.email) && req.body.password) {
    next();
  } else {
    res.status(400).send({ message: "Please provide an email and password" });
  }
};

// check what authorization token provided and if it is provided at all
const validateRole = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const payload = await jwtUtil.verifyTokenAndPayload(token);
      req.email = payload.email;
      req.role = payload.role;
      next();
    } catch (err) {
      res.status(400).send({
        message: "Token verification failure",
      });
    }
  } else {
    return res.status(401).send({
      message: "Not logged in",
    });
  }
};

// check if status is in [pending, denied, approved]
const validateStatus = (status) => {
  return status === "pending" || status === "denied" || status === "approved";
};

// check if type is in [food, lodging, others, travel]
const validateType = (type) => {
  return (
    type.toLowerCase() === "food" ||
    type.toLowerCase() === "lodging" ||
    type.toLowerCase() === "travel" ||
    type.toLowerCase() === "others"
  );
};

// check if amount is a number
const validateAmount = (amount) => {
  return !isNaN(amount);
};

module.exports = { validateInput, validateRole, validateStatus, validateType, validateAmount };
