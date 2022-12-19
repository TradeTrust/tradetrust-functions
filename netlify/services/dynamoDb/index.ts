import AWS from "aws-sdk";

const option =
  process.env.NODE_ENV === "test"
    ? {
        apiVersion: "2012-08-10",
        region: "localhost",
        endpoint: "http://localhost:8000",
        accessKeyId: "fakeMyKeyId",
        secretAccessKey: "fakeSecretAccessKey",
      }
    : {
        accessKeyId: process.env.TT_OCSP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.TT_OCSP_AWS_SECRET_ACCESS_KEY,
      };

export const dynamoDbClient = new AWS.DynamoDB.DocumentClient(option);
