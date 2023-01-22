const jwtUtil = require("../util/jwtUtil");

const validateManager = async function (req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const payload = await jwtUtil.verifyTokenAndPayload(token);
      if (payload.role === "manager") {
        req.email = payload.email;
        req.role = payload.role;
        next();
      } else {
        res.status(401).send({
          message: `You are not a manager. You are an ${payload.role}`,
        });
      }
    } catch (err) {
      res.status(401).send({
        message: "Token verification failure",
      });
    }
  } else {
    return res.status(401).send({
      message: "Not logged in",
    });
  }
};

module.exports = validateManager;
