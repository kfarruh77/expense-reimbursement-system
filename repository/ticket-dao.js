const aws = require("aws-sdk");
const uuid = require("uuid");

const table = "ticket";

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
      status: "pending",
      submittedBy: ticket.email,
    },
  };

  return docClient.put(params).promise();
};

module.exports = {
  submitTicket,
};
