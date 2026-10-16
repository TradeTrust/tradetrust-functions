import AWS, { S3 } from "aws-sdk";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";
import { isConditionalWriteConflict } from "../../functions/storage/reservationKey";

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

// putObject, not the managed upload: a multipart upload cannot carry these preconditions.
export const s3PutConditional = (
  params: S3.Types.PutObjectRequest,
  headers: Record<string, string>
) => {
  const request = s3.putObject({
    ...params,
    ...(headers["If-None-Match"]
      ? { IfNoneMatch: headers["If-None-Match"] }
      : {}),
  });
  const ifMatch = headers["If-Match"];
  if (ifMatch) {
    request.on("build", () => {
      request.httpRequest.headers["If-Match"] = ifMatch;
    });
  }
  return request.promise().catch((err) => {
    if (isConditionalWriteConflict(err)) {
      throw new createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
    }
    throw err;
  });
};

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

export const s3GetIfExists = (params: S3.Types.GetObjectRequest) =>
  s3
    .getObject(params)
    .promise()
    .then((results) => {
      if (results && results.Body) {
        return {
          body: JSON.parse(results.Body.toString()),
          etag: typeof results.ETag === "string" ? results.ETag : "",
        };
      }
      return null;
    })
    .catch((err) => {
      if (
        err.code === "NoSuchKey" ||
        err.code === "NotFound" ||
        err.statusCode === 404
      ) {
        return null;
      }
      throw new createError(400, err.message);
    });

export const s3Remove = (params: S3.Types.DeleteObjectRequest) =>
  s3.deleteObject(params).promise();
