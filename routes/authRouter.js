const express = require("express");
const router = express.Router();
const userDAO = require("../repository/users-dao");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwtUtil");
const { validateInput } = require("../util/authUtil");

router.post("/users", validateInput, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const role = "employee";

  const data = await userDAO.getUserByEmail(email);
  const user = data.Item;

  if (user) {
    res.status(400).send({ message: "Email is already in use" });
  } else {
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      await userDAO.registerUsers({ email, password: hashPassword, role });
      res.status(201).send({ message: "User created" });
    } catch {
      res.status(500).send({ message: "Error" });
    }
  }
});

router.post("/login", validateInput, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await userDAO.getUserByEmail(email);
  if (!user.Item) {
    return res.status(400).send({ message: "User does not exist" });
  }
  try {
    if (await bcrypt.compare(password, user.Item.password)) {
      const token = jwtUtil.createJWT(user.Item.email, user.Item.role);

      res.status(200).send({
        message: `Welcome ${user.Item.role} ${user.Item.email}`,
        token: token,
      });
    } else {
      res.status(404).send({ message: `Email and password do not match` });
    }
  } catch {
    res.status(500).send({ message: "Error" });
  }
});

module.exports = router;
