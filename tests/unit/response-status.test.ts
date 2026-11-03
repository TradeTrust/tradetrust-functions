import createError from "http-errors";
import { ERROR_MESSAGE } from "../../netlify/constants";
import {
  responseStatus,
  uploadErrorResponse,
} from "../../netlify/functions/storage/router";

describe("responseStatus", () => {
  it("keeps explicit reservation statuses", () => {
    expect(
      responseStatus(createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED))
    ).toBe(403);
    expect(
      responseStatus(createError(403, ERROR_MESSAGE.RESERVATION_EXPIRED))
    ).toBe(403);
    expect(
      responseStatus(createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS))
    ).toBe(409);
  });

  it("maps a rethrown storage failure to its 5xx status", () => {
    expect(
      responseStatus({
        message: "SlowDown",
        statusCode: 503,
        retryable: true,
      })
    ).toBe(503);
    expect(responseStatus({ message: "InternalError", statusCode: 500 })).toBe(
      500
    );
  });

  it("returns known reservation messages and hides storage errors", () => {
    expect(
      uploadErrorResponse(createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED))
    ).toEqual({
      status: 403,
      message: ERROR_MESSAGE.RESERVATION_REQUIRED,
      log: false,
    });
    expect(
      uploadErrorResponse(
        createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS)
      )
    ).toEqual({
      status: 409,
      message: ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS,
      log: false,
    });
    expect(
      uploadErrorResponse({
        message: "SlowDown: bucket secret arn:aws:s3:::private",
        statusCode: 503,
        retryable: true,
      })
    ).toEqual({
      status: 503,
      message: "Internal Server Error",
      log: true,
    });
    expect(uploadErrorResponse(new Error("stack details"))).toEqual({
      status: 400,
      message: ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR,
      log: true,
    });
  });

  it("keeps a client or unknown failure at 400", () => {
    expect(responseStatus(new Error("Document invalid."))).toBe(400);
    expect(responseStatus({ statusCode: 400, message: "BadRequest" })).toBe(
      400
    );
    expect(responseStatus(null)).toBe(400);
  });
});
