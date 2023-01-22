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

router.get("/viewTickets", validateEmployee, async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    try {
      const items = await ticketDAO.getTicketsByEmail(req.email);
      const data = items.Items;
      res.status(200).send(data);
    } catch {
      res.status(500).send("Error");
    }
  } else {
    try {
      const items = await ticketDAO.getTicketsByEmail(
        req.email,
        req.query.status
      );
      const data = items.Items;
      res.status(200).send(data);
    } catch {
      res.status(500).send("Error");
    }
  }
});

module.exports = router;
