import { createHmac, timingSafeEqual } from "crypto";
import { v4 as uuid } from "uuid";
import createError from "http-errors";
import { ERROR_MESSAGE } from "../../constants";
import { assertUnusedReservation, StoredObject } from "./reservationGuard";

const currentSecret = (): string => {
  const secret = process.env.STORAGE_RESERVATION_SECRET;
  if (!secret) {
    throw createError(500, ERROR_MESSAGE.RESERVATION_SECRET_MISSING);
  }
  return secret;
};

// During a rotation, keep the old value in STORAGE_RESERVATION_SECRET_PREVIOUS until
// every id issued under it has been uploaded. Issued ids expire after RESERVATION_TTL_SECONDS.
const acceptedSecrets = (): string[] => {
  const previous = process.env.STORAGE_RESERVATION_SECRET_PREVIOUS;
  return previous ? [currentSecret(), previous] : [currentSecret()];
};

// Same width as oa-encryption's generateEncryptionKey (256-bit hex).
export const reservationKeyFor = (
  id: string,
  secret: string = currentSecret()
): string => createHmac("sha256", secret).update(id).digest("hex");

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Shorter than the 30-day document lifecycle. After this, a deleted object
// cannot be recreated at the same id.
export const RESERVATION_TTL_SECONDS = 24 * 60 * 60;

// A separate HMAC input from reservationKeyFor, so the key handed to the client reveals nothing about the tag.
const reservationTag = (signed: string, secret: string): string =>
  createHmac("sha256", secret)
    .update(`reservation-id:${signed}`)
    .digest("hex")
    .slice(0, 32);

// Nothing is stored at queue time. The id carries proof of issue and an expiry.
export const issueReservationId = (): string => {
  const base = uuid();
  const expiresAt = Math.floor(Date.now() / 1000) + RESERVATION_TTL_SECONDS;
  const signed = `${base}.${expiresAt}`;
  return `${signed}.${reservationTag(signed, currentSecret())}`;
};

type IssuedReservation = {
  secret: string;
  expiresAtMs: number;
};

// The secret that issued this id, plus its expiry. Undefined when no accepted secret did.
const parseIssuedReservation = (id: string): IssuedReservation | undefined => {
  const [base, expiresAt, tag, ...rest] = id.split(".");
  if (
    rest.length > 0 ||
    !UUID_V4.test(base) ||
    !/^[0-9]{10,11}$/.test(expiresAt ?? "") ||
    !/^[0-9a-f]{32}$/.test(tag ?? "")
  ) {
    return undefined;
  }
  const expiresAtMs = Number(expiresAt) * 1000;
  if (!Number.isSafeInteger(expiresAtMs)) {
    return undefined;
  }
  const secret = acceptedSecrets().find((candidate) =>
    timingSafeEqual(
      Buffer.from(tag),
      Buffer.from(reservationTag(`${base}.${expiresAt}`, candidate))
    )
  );
  if (secret === undefined) {
    return undefined;
  }
  return { secret, expiresAtMs };
};

export const isIssuedReservationId = (id: string): boolean => {
  const issued = parseIssuedReservation(id);
  return issued !== undefined && issued.expiresAtMs > Date.now();
};

// A missing object is accepted only for an unexpired id that /queue issued, and
// gets the key derived with the secret that issued it. An object already in the
// bucket must still be an unused reservation from before this change.
export const keyForUpload = (
  stored: StoredObject | null | undefined,
  documentId: string
): string => {
  if (stored == null) {
    const issued = parseIssuedReservation(documentId);
    if (issued === undefined) {
      throw createError(403, ERROR_MESSAGE.RESERVATION_REQUIRED);
    }
    if (issued.expiresAtMs <= Date.now()) {
      throw createError(403, ERROR_MESSAGE.RESERVATION_EXPIRED);
    }
    return reservationKeyFor(documentId, issued.secret);
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
