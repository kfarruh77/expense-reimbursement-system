const validator = require("email-validator");
const jwtUtil = require("../util/jwtUtil");

const validateInput = function (req, res, next) {
  if (validator.validate(req.body.email) && req.body.password) {
    next();
  } else {
    res.status(400).send({ message: "Please provide an email and password" });
  }
};

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

const validateStatus = (status) => {
  return status !== "pending" && status !== "denied" && status !== "approved";
};

const validateType = (type) => {
  return (
    type.toLowerCase() === "food" ||
    type.toLowerCase() === "lodging" ||
    type.toLowerCase() === "travel" ||
    type.toLowerCase() === "others"
  );
};

const validateAmount = (amount) => {
  return !isNaN(amount);
};

module.exports = { validateInput, validateRole, validateStatus, validateType, validateAmount };
