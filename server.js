const express = require("express");
const app = express();
const PORT = 3000;
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRouter");
const employeeRouter = require("./routes/employeeRouter");

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to Expense Reimbursement System");
});

app.use("/", authRouter);

app.use("/employee", employeeRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
