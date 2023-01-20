const aws = require("aws-sdk");

const table = "users";

aws.config.update({
  region: "us-east-2",
});

const docClient = new aws.DynamoDB.DocumentClient();

const registerUsers = (user) => {
  const params = {
    TableName: table,
    Item: {
      email: user.email,
      password: user.password,
      role: user.role,
    },
  };

  return docClient.put(params).promise();
};

const getUserByEmail = (email) => {
  const params = {
    TableName: table,
    Key: {
      email,
    },
  };

  return docClient.get(params).promise();
};

module.exports = {
  registerUsers,
  getUserByEmail,
};
