import AWS from "aws-sdk";
import { ERROR_MESSAGE } from "../../netlify/constants";
import { s3PutConditional } from "../../netlify/services/s3";

// Operations are installed on the service prototype, not AWS.S3.prototype.
const s3Prototype = Object.getPrototypeOf(
  new AWS.S3({ accessKeyId: "test", secretAccessKey: "test" })
);

describe("s3PutConditional", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("puts a new object with If-None-Match", async () => {
    const putObject = jest
      .spyOn(s3Prototype, "putObject")
      .mockImplementation(() => {
        return {
          on() {
            return this;
          },
          promise: async () => ({}),
        } as unknown as AWS.Request<AWS.S3.PutObjectOutput, AWS.AWSError>;
      });

    await s3PutConditional(
      { Bucket: "test-bucket", Key: "document-id", Body: "{}" },
      { "If-None-Match": "*" }
    );

    expect(putObject).toHaveBeenCalledWith(
      expect.objectContaining({ IfNoneMatch: "*", Key: "document-id" })
    );
  });

  it("attaches If-Match before the existing reservation is replaced", async () => {
    let matched = "";
    jest.spyOn(s3Prototype, "putObject").mockImplementation(() => {
      const request = {
        httpRequest: { headers: {} as Record<string, string> },
        on(event: string, listener: () => void) {
          if (event === "build") listener();
          return this;
        },
        promise: async () => {
          matched = request.httpRequest.headers["If-Match"];
          return {};
        },
      };
      return request as unknown as AWS.Request<
        AWS.S3.PutObjectOutput,
        AWS.AWSError
      >;
    });

    await s3PutConditional(
      { Bucket: "test-bucket", Key: "document-id", Body: "{}" },
      { "If-Match": '"legacy-etag"' }
    );

    expect(matched).toBe('"legacy-etag"');
  });

  it("returns a conflict when the precondition fails", async () => {
    jest.spyOn(s3Prototype, "putObject").mockImplementation(() => {
      return {
        on() {
          return this;
        },
        promise: async () => {
          throw { code: "PreconditionFailed", statusCode: 412 };
        },
      } as unknown as AWS.Request<AWS.S3.PutObjectOutput, AWS.AWSError>;
    });

    await expect(
      s3PutConditional(
        { Bucket: "test-bucket", Key: "document-id", Body: "{}" },
        { "If-None-Match": "*" }
      )
    ).rejects.toThrow(ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  });
});
