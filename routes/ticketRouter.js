const express = require("express");
const router = express.Router();
const ticketDAO = require("../repository/ticket-dao");
const {
  validateRole,
  validateStatus,
  validateType,
} = require("../util/authUtil");

router.get("/dashboard", validateRole, (req, res) => {
  if (req.role === "employee") {
    res.status(200).send({ message: `Welcome employee ${req.email}` });
  } else if (req.role === "manager") {
    res.status(200).send({ message: `Welcome manager ${req.email}` });
  }
});

router.post("/tickets", validateRole, async (req, res) => {
  if (req.role === "employee") {
    const amount = req.body.amount;
    const description = req.body.description;
    const type = req.body.type;

    if (!(typeof amount === "number") || !description || !validateType(type)) {
      return res.status(400).send({
        message: "Please provide valid amount, description and/or type",
      });
    }

    try {
      await ticketDAO.submitTicket({
        amount,
        description,
        type,
        email: req.email,
      });
      res.status(201).send({ message: "Ticket created" });
    } catch {
      res.status(500).send({ message: "Error" });
    }
  } else {
    res.status(403).send({ message: "You are not an employee" });
  }
});

router.get("/tickets", validateRole, async (req, res) => {
  if (req.role === "employee") {
    if (Object.keys(req.query).length === 0) {
      try {
        const items = await ticketDAO.getTicketsByEmail(req.email);
        const data = items.Items;
        res.status(200).send(data);
      } catch {
        res.status(500).send({ message: "Error" });
      }
    } else {
      if (req.query.status && validateStatus(req.query.status)) {
        return res.status(400).send({
          message: "Please provide a proper status (pending/approved/denied)",
        });
      }
      if (req.query.type && !validateType(req.query.type)) {
        return res.status(400).send({
          message: "Please provide a proper type (lodging/food/travel/others)",
        });
      }
      try {
        const items = await ticketDAO.getTicketsByEmail(
          req.email,
          req.query.status,
          req.query.type
        );
        const data = items.Items;
        res.status(200).send(data);
      } catch {
        res.status(500).send({ message: "Error" });
      }
    }
  } else {
    if (Object.keys(req.query).length === 0) {
      const items = await ticketDAO.getAllTickets();
      res.status(200).send(items.Items);
    } else {
      if (validateStatus(req.query.status)) {
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
  }
});

router.patch("/tickets/:id/status", validateRole, async (req, res) => {
  if (req.role === "manager") {
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
          res
            .status(200)
            .send({ message: "Ticket status successfully updated" });
        } catch {
          res.status(500).send({ message: "Error" });
        }
      } else {
        res.status(405).send({ message: "Ticket status already validated" });
      }
    } else {
      res.status(404).send({ message: "Ticket not found" });
    }
  } else {
    res.status(403).send({ message: "You are not a manager" });
  }
});

module.exports = router;
