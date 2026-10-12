import createError from "http-errors";
import { ERROR_MESSAGE } from "../../netlify/constants";
import { assertUnusedReservation } from "../../netlify/functions/storage/reservationAuth";

describe("assertUnusedReservation", () => {
  const reservationKey = "reservation-key";

  it("returns the stored key when the caller proves an unused reservation", () => {
    expect(
      assertUnusedReservation({ key: reservationKey }, reservationKey)
    ).toBe(reservationKey);
  });

  it("rejects a write that does not prove the reservation key", () => {
    expect(() => assertUnusedReservation({ key: reservationKey }, "other")).toThrow(
      ERROR_MESSAGE.RESERVATION_PROOF_INVALID
    );
    try {
      assertUnusedReservation({ key: reservationKey }, undefined);
    } catch (err) {
      expect(createError.isHttpError(err) && err.status).toBe(403);
    }
  });

  it("rejects a write over a stored document even when the key is presented again", () => {
    try {
      assertUnusedReservation(
        { key: reservationKey, document: { cipherText: "stored" } },
        reservationKey
      );
      throw new Error("expected rejection");
    } catch (err) {
      expect(createError.isHttpError(err) && err.status).toBe(409);
      expect((err as Error).message).toBe(ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
    }
  });
});
