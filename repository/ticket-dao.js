const aws = require("aws-sdk");
const uuid = require("uuid");

const table = "tickets";

aws.config.update({
  region: "us-east-2",
});

const docClient = new aws.DynamoDB.DocumentClient();

const submitTicket = (ticket) => {
  const params = {
    TableName: table,
    Item: {
      ticket_id: uuid.v4(),
      amount: ticket.amount,
      description: ticket.description,
      type: ticket.type,
      status: "pending",
      submittedBy: ticket.email,
    },
  };

  return docClient.put(params).promise();
};

const getTicketsByStatus = (status) => {
  const params = {
    TableName: table,
    IndexName: "status-index",
    KeyConditionExpression: "#s = :val",
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ExpressionAttributeValues: {
      ":val": status,
    },
  };

  let items;
  do {
    items = docClient.query(params).promise();
    params.ExclusiveStarterKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  return items;
};

const updateTicketStatus = (id, status) => {
  const params = {
    TableName: table,
    Key: {
      ticket_id: id,
    },
    UpdateExpression: "set #s = :val",
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ExpressionAttributeValues: {
      ":val": status,
    },
  };

  return docClient.update(params).promise();
};

const getTicketById = (id) => {
  const params = {
    TableName: table,
    Key: {
      ticket_id: id,
    },
  };

  return docClient.get(params).promise();
};

const getTicketsByEmail = (email, status = "", type = "") => {
  let params;
  if (!status && !type) {
    params = {
      TableName: table,
      IndexName: "submittedBy-index",
      KeyConditionExpression: "#sB = :val",
      ExpressionAttributeNames: {
        "#sB": "submittedBy",
      },
      ExpressionAttributeValues: {
        ":val": email,
      },
    };
  } else if (status && !type) {
    params = {
      TableName: table,
      IndexName: "submittedBy-index",
      KeyConditionExpression: "#sB = :val",
      FilterExpression: "#s = :val2",

      ExpressionAttributeNames: {
        "#sB": "submittedBy",
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":val": email,
        ":val2": status,
      },
    };
  } else if (!status && type) {
    params = {
      TableName: table,
      IndexName: "submittedBy-index",
      KeyConditionExpression: "#sB = :val",
      FilterExpression: "#t = :val2",

      ExpressionAttributeNames: {
        "#sB": "submittedBy",
        "#t": "type",
      },
      ExpressionAttributeValues: {
        ":val": email,
        ":val2": type,
      },
    };
  } else {
    params = {
      TableName: table,
      IndexName: "submittedBy-index",
      KeyConditionExpression: "#sB = :val",
      FilterExpression: "#s = :val2 and #t = :val3",

      ExpressionAttributeNames: {
        "#sB": "submittedBy",
        "#s": "status",
        "#t": "type",
      },
      ExpressionAttributeValues: {
        ":val": email,
        ":val2": status,
        ":val3": type,
      },
    };
  }

  let items;
  do {
    items = docClient.query(params).promise();
    params.ExclusiveStarterKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  return items;
};

const getAllTickets = () => {
  const params = {
    TableName: table,
  };

  let items;
  do {
    items = docClient.scan(params).promise();
    params.ExclusiveStarterKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  return items;
};

module.exports = {
  submitTicket,
  getTicketsByStatus,
  updateTicketStatus,
  getTicketById,
  getTicketsByEmail,
  getAllTickets,
};
