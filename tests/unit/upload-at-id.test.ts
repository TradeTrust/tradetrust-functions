jest.mock("../../netlify/services/s3", () => ({
  s3Put: jest.fn(),
  s3PutConditional: jest.fn(),
  s3Get: jest.fn(),
  s3GetIfExists: jest.fn(),
}));

jest.mock("../../netlify/utils", () => ({
  validateNetwork: jest.fn(async () => ({ chainId: 1 })),
  validateDocument: jest.fn(async () => undefined),
  getEncryptedDocument: jest.fn(async ({ existingKey }) => ({
    encryptedDocument: { cipherText: "cipher" },
    encryptedDocumentKey: existingKey,
    type: "OPEN-ATTESTATION-TYPE-1",
  })),
}));

import { ERROR_MESSAGE } from "../../netlify/constants";
import { uploadDocumentAtId } from "../../netlify/functions/storage/helpers";
import { issueReservationId } from "../../netlify/functions/storage/reservationKey";
import { s3GetIfExists, s3PutConditional } from "../../netlify/services/s3";

const getIfExists = s3GetIfExists as jest.Mock;
const putConditional = s3PutConditional as jest.Mock;

describe("uploadDocumentAtId", () => {
  beforeEach(() => {
    process.env.STORAGE_RESERVATION_SECRET = "test-reservation-secret";
    process.env.TT_AWS_BUCKET_NAME = "test-bucket";
    jest.clearAllMocks();
    putConditional.mockResolvedValue({});
  });

  it("writes a missing object only if it is still absent", async () => {
    getIfExists.mockResolvedValue(null);
    const id = issueReservationId();

    await uploadDocumentAtId({ data: "doc" }, id);

    expect(putConditional).toHaveBeenCalledWith(
      expect.objectContaining({ Key: id }),
      { "If-None-Match": "*" }
    );
  });

  it("does not write a missing object for an id /queue did not issue", async () => {
    getIfExists.mockResolvedValue(null);

    await expect(
      uploadDocumentAtId({ data: "doc" }, "document-id")
    ).rejects.toThrow(ERROR_MESSAGE.RESERVATION_REQUIRED);
    expect(putConditional).not.toHaveBeenCalled();
  });

  it("writes a legacy reservation only if that version is unchanged", async () => {
    getIfExists.mockResolvedValue({
      body: { key: "legacy-reservation-key" },
      etag: '"legacy-etag"',
    });

    const result = await uploadDocumentAtId({ data: "doc" }, "document-id");

    expect(result.key).toBe("legacy-reservation-key");
    expect(putConditional).toHaveBeenCalledWith(
      expect.objectContaining({ Key: "document-id" }),
      { "If-Match": '"legacy-etag"' }
    );
  });

  it("does not write when a document is already stored", async () => {
    getIfExists.mockResolvedValue({
      body: {
        key: "legacy-reservation-key",
        document: { cipherText: "stored" },
      },
      etag: '"stored-etag"',
    });

    await expect(
      uploadDocumentAtId({ data: "doc" }, "document-id")
    ).rejects.toThrow(ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
    expect(putConditional).not.toHaveBeenCalled();
  });
});
