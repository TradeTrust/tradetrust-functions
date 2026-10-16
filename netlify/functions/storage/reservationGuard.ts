import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";

export type StoredObject = {
  key?: unknown;
  document?: unknown;
};

// A shared document id may be written once, and only while it is still an unused reservation.
export const assertUnusedReservation = (
  stored: StoredObject | null | undefined
): string => {
  if (stored != null && typeof stored === "object" && stored.document != null) {
    throw createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  }

  if (!stored || typeof stored.key !== "string" || stored.key.length === 0) {
    throw createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED);
  }

  return stored.key;
};
