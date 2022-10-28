import {
  openAttestationVerifiers,
  openAttestationDidIdentityProof,
  verificationBuilder,
  isValid,
} from "@govtechsg/oa-verify";
import { encryptString } from "@govtechsg/oa-encryption";
import createError from "http-errors";
import {
  ALLOWED_ORIGINS,
  ERROR_MESSAGE,
  SUPPORTED_NETWORKS,
  NETWORK,
} from "./constants";

// https://github.com/expressjs/cors#configuring-cors-w-dynamic-origin
export const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // allow requests with no origin, like mobile apps or curl requests

  if (ALLOWED_ORIGINS.includes(origin)) {
    return callback(null, true);
  } else {
    return callback(new Error(ERROR_MESSAGE.CORS_UNALLOWED), false);
  }
};

export const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(400).send(ERROR_MESSAGE.API_KEY_INVALID);
  }
  next();
};

export const validateDocument = async ({
  document,
  network,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: any;
  network: NETWORK;
}) => {
  const verify = verificationBuilder(
    [...openAttestationVerifiers, openAttestationDidIdentityProof],
    {
      provider: SUPPORTED_NETWORKS[network].provider(),
    },
  );

  const fragments = await verify(document);

  if (!isValid(fragments)) {
    throw new createError(400, ERROR_MESSAGE.DOCUMENT_INVALID);
  }

  return fragments;
};

export const getEncryptedDocument = async ({
  str,
  existingKey,
}: {
  str: string;
  existingKey?: string;
}) => {
  const { key, ...encryptedDocument } = await encryptString(str, existingKey);

  return { encryptedDocument, encryptedDocumentKey: key };
};
