const express = require("express");
const router = express.Router();
const validateManager = require("../util/managerUtil");
const ticketDAO = require("../repository/ticket-dao");

router.get("/dashboard", validateManager, (req, res) => {
  res.status(200).send({
    message: `Welcome manager ${req.email}`,
  });
});

router.get("/tickets", validateManager, async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    const items = await ticketDAO.getAllTickets();
    res.status(200).send(items.Items);
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
      const items = await ticketDAO.getTicketsByStatus(req.query.status);
      const data = items.Items;
      res.status(200).send(data);
    } catch {
      res.status(500).send({ message: "Error" });
    }
  }
});

router.patch("/tickets/:id/status", validateManager, async (req, res) => {
  if (
    !req.body.status ||
    (req.body.status !== "denied" && req.body.status !== "approved")
  ) {
    return res.status(400).send({
      message: "Please provide a proper validation status (denied/approved)",
    });
  }
  const item = await ticketDAO.getTicketById(req.params.id);
  const data = item.Item;
  if (data) {
    if (data.status === "pending") {
      try {
        await ticketDAO.updateTicketStatus(req.params.id, req.body.status);
        res.status(200).send({ message: "Ticket status successfully updated" });
      } catch {
        res.status(500).send({ message: "Error" });
      }
    } else {
      res.status(405).send({ message: "Ticket status already validated" });
    }
  } else {
    res.status(404).send({ message: "Ticket not found" });
  }
});

module.exports = router;
