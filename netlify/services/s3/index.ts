import AWS, { S3 } from "aws-sdk";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";

const option =
  process.env.NODE_ENV === "test"
    ? {
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER",
        endpoint: `http://localhost:4568`,
        sslEnabled: false,
        s3ForcePathStyle: true,
      }
    : {
        accessKeyId: process.env.TT_STORAGE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.TT_STORAGE_AWS_SECRET_ACCESS_KEY,
      };

const s3 = new AWS.S3(option);

export const s3Put = (params: S3.Types.PutObjectRequest) =>
  s3.upload(params).promise();

export const s3Get = (params: S3.Types.GetObjectRequest) =>
  s3
    .getObject(params)
    .promise()
    .then((results) => {
      if (results && results.Body) {
        return JSON.parse(results.Body.toString());
      }
      throw new createError(400, ERROR_MESSAGE.DOCUMENT_NOT_FOUND);
    })
    .catch((err) => {
      throw new createError(400, err.message);
    });

export const s3Remove = (params: S3.Types.DeleteObjectRequest) =>
  s3.deleteObject(params).promise();
