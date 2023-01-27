const { S3 } = require("aws-sdk");
const uuid = require("uuid");

const bucketName = "reimbursement-receipt-images";

// upload the given file into s3 bucket
const s3Upload = (file) => {
  const s3 = new S3();

  const param = {
    Bucket: bucketName,
    Key: `${uuid.v4()}-${file.originalname}`,
    Body: file.buffer,
  };

  return s3.upload(param).promise();
};

module.exports = s3Upload;
