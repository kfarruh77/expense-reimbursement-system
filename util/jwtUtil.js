const jwt = require("jsonwebtoken");
const Promise = require("bluebird");

function createJWT(email, role) {
  return jwt.sign(
    {
      email,
      role,
    },
    "secretkey",
    {
      expiresIn: "1d",
    }
  );
}

jwt.verify = Promise.promisify(jwt.verify);

function verifyTokenAndPayload(token) {
  return jwt.verify(token, "secretkey");
}

module.exports = {
  createJWT,
  verifyTokenAndPayload,
};
