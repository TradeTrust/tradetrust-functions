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

// Bind the later write to the object state the read just observed.
// Absent: create only if the key is still missing. Present: replace only that version.
export const writeHeadersForObserved = (
  observed: { etag: string } | null
): Record<string, string> => {
  if (observed == null) {
    return { "If-None-Match": "*" };
  }
  if (observed.etag.length === 0) {
    throw createError(409, ERROR_MESSAGE.DOCUMENT_ALREADY_EXISTS);
  }
  return { "If-Match": observed.etag };
};

export const isConditionalWriteConflict = (err: unknown): boolean => {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const code = "code" in err ? (err as { code?: unknown }).code : undefined;
  const statusCode =
    "statusCode" in err
      ? (err as { statusCode?: unknown }).statusCode
      : undefined;
  return (
    statusCode === 412 ||
    code === "PreconditionFailed" ||
    code === "ConditionalRequestConflict"
  );
};
