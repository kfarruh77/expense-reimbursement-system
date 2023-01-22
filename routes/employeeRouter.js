const express = require("express");
const router = express.Router();
const validateEmployee = require("../util/employeeUtil");
const ticketDAO = require("../repository/ticket-dao");

router.get("/dashboard", validateEmployee, (req, res) => {
  res.status(200).send({
    message: `Welcome employee ${req.email}`,
  });
});

router.post("/submitTicket", validateEmployee, async (req, res) => {
  const amount = req.body.amount;
  const description = req.body.description;

  try {
    await ticketDAO.submitTicket({
      amount,
      description,
      email: req.email,
    });
    res.status(201).send("Ticket created");
  } catch {
    res.status(500).send("error");
  }
});

module.exports = router;
