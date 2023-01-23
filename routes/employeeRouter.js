const express = require("express");
const router = express.Router();
const validateEmployee = require("../util/employeeUtil");
const ticketDAO = require("../repository/ticket-dao");

router.get("/dashboard", validateEmployee, (req, res) => {
  res.status(200).send({
    message: `Welcome employee ${req.email}`,
  });
});

router.post("/tickets", validateEmployee, async (req, res) => {
  const amount = req.body.amount;
  const description = req.body.description;

  if (!(typeof amount === "number") || !description) {
    return res.status(400).send("Please provide amount and description");
  }

  try {
    await ticketDAO.submitTicket({
      amount,
      description,
      email: req.email,
    });
    res.status(201).send("Ticket created");
  } catch {
    res.status(500).send("Error");
  }
});

router.get("/tickets", validateEmployee, async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    try {
      const items = await ticketDAO.getTicketsByEmail(req.email);
      const data = items.Items;
      res.status(200).send(data);
    } catch {
      res.status(500).send({ message: "Error" });
    }
  } else {
    if (
      req.query.status !== "pending" &&
      req.query.status !== "denied" &&
      req.query.status !== "approved"
    ) {
      return res.status(400).send({
        message: "Please provide a proper status (pending/approved/denied)",
      });
    }
    try {
      const items = await ticketDAO.getTicketsByEmail(
        req.email,
        req.query.status
      );
      const data = items.Items;
      res.status(200).send(data);
    } catch {
      res.status(500).send({ message: "Error" });
    }
  }
});

module.exports = router;
