import { createHmac } from "crypto";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";
import { assertUnusedReservation, StoredObject } from "./reservationGuard";

// Same width as oa-encryption's generateEncryptionKey (256-bit hex).
export const reservationKeyFor = (id: string): string => {
  const secret = process.env.STORAGE_RESERVATION_SECRET;
  if (!secret) {
    throw createError(500, ERROR_MESSAGE.RESERVATION_SECRET_MISSING);
  }
  return createHmac("sha256", secret).update(id).digest("hex");
};

// A missing object is a new reservation. An object already in the bucket
// must still be an unused reservation from before this change.
export const keyForUpload = (
  stored: StoredObject | null | undefined,
  documentId: string
): string => {
  if (stored == null) {
    return reservationKeyFor(documentId);
  }
  return assertUnusedReservation(stored);
};
