const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRouter");
const ticketRouter = require("./routes/ticketRouter");

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to Expense Reimbursement System" });
});

app.use("/", authRouter);

app.use("/", ticketRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
