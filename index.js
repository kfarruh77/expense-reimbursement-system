const express = require("express");
const app = express();
const PORT = 3000;
const bcrypt = require("bcrypt");

app.use(express.json());

const users = [];

app.get("/", (req, res) => {
  res.send("Welcome to Expense Reimbursement System");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/register", async (req, res) => {
  const userCheck = users.find((user) => user.email === req.body.email);
  if (userCheck) {
    res.status(400).send("Email is already in use");
  } else {
    try {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      const user = { email: req.body.email, password: hashPassword };
      users.push(user);
      res.status(201).send("User created");
    } catch {
      res.status(500).send();
    }
  }
});

app.post("/login", async (req, res) => {
  const user = users.find((user) => user.email === req.body.email);
  if (!user) {
    return res.status(400).send("User does not exist");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send(`Welcome ${user.email}`);
    } else {
      res.send(`Email and/or password do not match`);
    }
  } catch {
    res.status(500).send();
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
