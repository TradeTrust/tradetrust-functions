import { assertUnusedReservation } from "../../netlify/functions/storage/reservationGuard";
import { ERROR_MESSAGE } from "../../netlify/constants";

describe("assertUnusedReservation", () => {
  it("returns the reservation key when the slot is unused", () => {
    expect(assertUnusedReservation({ key: "reservation-key" })).toBe(
      "reservation-key"
    );
  });

  it("rejects a slot that already holds a document", () => {
    try {
      assertUnusedReservation({
        key: "reservation-key",
        document: { cipherText: "stored" },
      });
      throw new Error("expected rejection");
    } catch (err) {
      expect(err).toMatchObject({
        status: 409,
        message: ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS,
      });
    }
  });

  it("rejects a slot that is not a reservation", () => {
    expect(() => assertUnusedReservation({})).toThrow(
      ERROR_MESSAGE.RESERVATION_REQUIRED
    );
    expect(() => assertUnusedReservation(undefined)).toThrow(
      ERROR_MESSAGE.RESERVATION_REQUIRED
    );
  });
});
