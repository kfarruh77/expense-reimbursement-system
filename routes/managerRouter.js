const express = require("express");
const router = express.Router();
const validateManager = require("../util/managerUtil");
const ticketDAO = require("../repository/ticket-dao");

router.get("/dashboard", validateManager, (req, res) => {
  res.status(200).send({
    message: `Welcome manager ${req.email}`,
  });
});

router.get("/viewTickets", validateManager, async (req, res) => {
  let items = await ticketDAO.getTicketsByStatus("pending");
  res.status(200).send(items.Items);
});

router.put("/validateTicket/:id", validateManager, async (req, res) => {
  const item = await ticketDAO.getTicketById(req.params.id);
  const data = item.Item;
  if (data) {
    if (data.status === "pending") {
      try {
        await ticketDAO.updateTicketStatus(req.params.id, req.body.status);
        res.status(200).send("Ticket status successfully updated");
      } catch {
        res.status(500).send("Error");
      }
    } else {
      res.status(405).send("Ticket status already validated");
    }
  } else {
    res.status(404).send("Ticket not found");
  }
});

module.exports = router;
