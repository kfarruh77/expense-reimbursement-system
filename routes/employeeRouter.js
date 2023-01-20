const express = require("express");
const router = express.Router();
const userDAO = require("../repository/users-dao");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwtUtil");

router.get("/dashboard", async (req, res) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(401).send({
      message: "Not logged in",
    });
  }
  try {
    const payload = await jwtUtil.verifyTokenAndPayload(token);
    if (payload.role === "employee") {
      res.status(200).send({
        message: `welcome employee ${payload.email}`,
      });
    } else {
      res.status(401).send({
        message: `You are not an employee. You are a ${payload.role}`,
      });
    }
  } catch (err) {
    res.status(401).send({
      message: "Token verification failure",
    });
  }
});

module.exports = router;
