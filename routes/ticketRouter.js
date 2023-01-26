const express = require("express");
const router = express.Router();
const ticketDAO = require("../repository/ticket-dao");
const { getAllUsers, getUserByEmail, updateUserRoleByEmail } = require("../repository/users-dao");
const { validateRole, validateStatus, validateType, validateAmount } = require("../util/authUtil");

const multer = require("multer");
const s3Upload = require("../repository/receipt-s3");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

router.get("/dashboard", validateRole, (req, res) => {
  if (req.role === "employee") {
    res.status(200).send({ message: `Welcome employee ${req.email}` });
  } else if (req.role === "manager") {
    res.status(200).send({ message: `Welcome manager ${req.email}` });
  }
});

router.post("/tickets", validateRole, upload.single("image"), async (req, res) => {
  if (req.role === "employee") {
    const amount = Number(req.body.amount);
    const description = req.body.description;
    const type = req.body.type;
    let imgLoc;

    if (!validateAmount(amount) || !description || !validateType(type)) {
      return res.status(400).send({
        message: "Please provide valid amount, description and/or type",
      });
    }

    try {
      if (req.file) {
        result = await s3Upload(req.file);
        imgLoc = result.Location;
      } else {
        imgLoc = "No image";
      }

      await ticketDAO.submitTicket({
        amount,
        description,
        type,
        email: req.email,
        receiptImage: imgLoc,
      });
      res.status(201).send({ message: "Ticket created" });
    } catch {
      res.status(500).send({ message: "Error" });
    }
  } else {
    res.status(401).send({ message: "You are not an employee" });
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
      if (req.query.status && !validateStatus(req.query.status)) {
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
      if (!validateStatus(req.query.status)) {
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
    if (!req.body.status || (req.body.status !== "denied" && req.body.status !== "approved")) {
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
        res.status(403).send({ message: "Ticket status already validated" });
      }
    } else {
      res.status(404).send({ message: "Ticket not found" });
    }
  } else {
    res.status(401).send({ message: "You are not a manager" });
  }
});

router.get("/users", validateRole, async (req, res) => {
  if (req.role === "manager") {
    const items = await getAllUsers();
    const data = items.Items;
    const filteredData = data.map(({ password, ...rest }) => rest);
    res.status(200).send(filteredData);
  } else {
    res.status(401).send({ message: "You are not a manager" });
  }
});

router.patch("/users/:email", validateRole, async (req, res) => {
  if (req.role === "manager") {
    const email = req.params.email;
    const user = await getUserByEmail(email);
    if (!user.Item) {
      return res.status(404).send({ message: "User does not exist" });
    }
    const tickets = (await ticketDAO.getTicketsByEmail(email)).Items;
    if (tickets?.some((ticket) => ticket.status === "pending")) {
      return res.status(403).send({ message: "User has pending tickets" });
    }
    if (email === req.email) {
      return res.status(403).send({ message: "You are not allowed to change your own role" });
    }
    let roleChange = "manager";
    if (user.Item.role === "manager") {
      roleChange = "employee";
    }
    await updateUserRoleByEmail(email, roleChange);
    res.status(200).send({ message: `User role changed` });
  } else {
    res.status(401).send({ message: "You are not a manager" });
  }
});

module.exports = router;
