import { createHash, timingSafeEqual } from "crypto";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";

export type StoredObject = {
  key?: unknown;
  document?: unknown;
};

const secretsMatch = (expected: string, provided: string): boolean => {
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  const providedHash = createHash("sha256").update(provided, "utf8").digest();
  return timingSafeEqual(expectedHash, providedHash);
};

// A write may target an id only when that id is still an unused queue
// reservation and the caller proves they hold the reservation key.
export const assertUnusedReservation = (
  stored: StoredObject | null | undefined,
  reservationKey: unknown
): string => {
  if (stored != null && typeof stored === "object" && stored.document != null) {
    throw createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  }

  if (!stored || typeof stored.key !== "string" || stored.key.length === 0) {
    throw createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED);
  }

  if (
    typeof reservationKey !== "string" ||
    !secretsMatch(stored.key, reservationKey)
  ) {
    throw createError(403, ERROR_MESSAGE.RESERVATION_PROOF_INVALID);
  }

  return stored.key;
};
