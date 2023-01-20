const express = require("express");
const router = express.Router();
const userDAO = require("../repository/users-dao");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwtUtil");

router.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let role = req.body.role;
  if (!role) {
    role = "employee";
  }

  const data = await userDAO.getUserByEmail(email);
  const user = data.Item;

  if (user) {
    res.status(400).send("Email is already in use");
  } else {
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      await userDAO.registerUsers({ email, password: hashPassword, role });
      res.status(201).send("User created");
    } catch {
      res.status(500).send("error");
    }
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await userDAO.getUserByEmail(email);

  if (!user.Item) {
    return res.status(400).send("User does not exist");
  }
  try {
    if (await bcrypt.compare(password, user.Item.password)) {
      const token = jwtUtil.createJWT(user.Item.email, user.Item.role);

      res.status(200).send({
        message: `Welcome user ${user.Item.email} ${user.Item.role}`,
        token: token,
      });
    } else {
      res.send(`Email and password do not match`);
    }
  } catch {
    res.status(500).send("ERROR2");
  }
});

module.exports = router;
