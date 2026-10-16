import AWS from "aws-sdk";
import { ERROR_MESSAGE } from "../../netlify/constants";
import { s3GetIfExists } from "../../netlify/services/s3";

const s3Prototype = Object.getPrototypeOf(
  new AWS.S3({ accessKeyId: "test", secretAccessKey: "test" })
);

const getObjectResult = (value: unknown) =>
  ({
    promise: async () => value,
  } as unknown as AWS.Request<AWS.S3.GetObjectOutput, AWS.AWSError>);

describe("s3GetIfExists", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null only when the key is missing", async () => {
    jest.spyOn(s3Prototype, "getObject").mockImplementation(() => {
      return {
        promise: async () => {
          throw { code: "NoSuchKey", statusCode: 404 };
        },
      } as unknown as AWS.Request<AWS.S3.GetObjectOutput, AWS.AWSError>;
    });

    await expect(
      s3GetIfExists({ Bucket: "test-bucket", Key: "document-id" })
    ).resolves.toBeNull();
  });

  it("rejects a successful read that has no body", async () => {
    jest.spyOn(s3Prototype, "getObject").mockImplementation(() => {
      return getObjectResult({ ETag: '"stored-etag"' });
    });

    await expect(
      s3GetIfExists({ Bucket: "test-bucket", Key: "document-id" })
    ).rejects.toMatchObject({
      status: 409,
      message: ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS,
    });
  });

  it("returns the stored body and etag", async () => {
    jest.spyOn(s3Prototype, "getObject").mockImplementation(() => {
      return getObjectResult({
        Body: Buffer.from(JSON.stringify({ key: "legacy-reservation-key" })),
        ETag: '"legacy-etag"',
      });
    });

    await expect(
      s3GetIfExists({ Bucket: "test-bucket", Key: "document-id" })
    ).resolves.toEqual({
      body: { key: "legacy-reservation-key" },
      etag: '"legacy-etag"',
    });
  });
});
