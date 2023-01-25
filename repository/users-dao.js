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

const getAllUsers = () => {
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

const updateUserRoleByEmail = (email, role) => {
  const params = {
    TableName: table,
    Key: {
      email,
    },
    UpdateExpression: "set #r = :val",
    ExpressionAttributeNames: {
      "#r": "role",
    },
    ExpressionAttributeValues: {
      ":val": role,
    },
  };

  return docClient.update(params).promise();
};

module.exports = {
  registerUsers,
  getUserByEmail,
  getAllUsers,
  updateUserRoleByEmail,
};
