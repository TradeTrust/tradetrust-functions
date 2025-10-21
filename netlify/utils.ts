import {
  isValid,
  WrappedDocument,
  OpenAttestationDocument,
  networkName,
  isWrappedV2Document,
  getDataV2,
  isWrappedV3Document,
  vc,
  verifyDocument,
  isRawV3Document,
  SignedVerifiableCredential,
  isTransferableRecord,
  RawVerifiableCredential,
  WrappedOrSignedOpenAttestationDocument,
  VerificationFragment,
} from "@trustvc/trustvc";
import { Request, Response, NextFunction } from "express";

import { encryptString } from "@govtechsg/oa-encryption";
import createError from "http-errors";
import {
  ALLOWED_ORIGIN_REGEX,
  LOCALHOST_ORIGINS,
  ERROR_MESSAGE,
  SUPPORTED_NETWORKS,
} from "./constants";

// https://github.com/expressjs/cors#configuring-cors-w-dynamic-origin
export const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin) return callback(null, true); // allow requests with no origin, like mobile apps or curl requests
  if (ALLOWED_ORIGIN_REGEX.test(origin)) {
    return callback(null, true);
  } else if (
    LOCALHOST_ORIGINS.includes(origin) &&
    process.env.NODE_ENV === "test"
  ) {
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

// Middleware to validate Origin/Referer for unsafe methods
export const isTrustedOrigin = (candidate: string | undefined) => {
  if (!candidate) return false;
  let origin: string;
  try {
    origin = candidate.includes("://") ? new URL(candidate).origin : candidate;
  } catch {
    return false;
  }
  if (ALLOWED_ORIGIN_REGEX.test(origin)) return true;
  if (
    LOCALHOST_ORIGINS.includes(origin) &&
    process.env.NODE_ENV === "test"
  )
    return true;
  return false;
};

export const originReferrerGuard = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originHeader = (req.headers.origin as string | undefined) || undefined;
  const refererHeader =
    (req.headers.referer as string | undefined) || undefined;

  let candidateOrigin = originHeader;
  if (!candidateOrigin && refererHeader) {
    try {
      candidateOrigin = new URL(refererHeader).origin;
    } catch {
      candidateOrigin = undefined;
    }
  }

  if (!candidateOrigin) {
    // Allow M2M (non-browser) requests without Origin/Referer only if API key is valid
    const apiKey = req.headers["x-api-key"] as string | undefined;
    if (apiKey && apiKey === process.env.API_KEY) return next();
    return res.status(403).json({ error: "Missing Origin/Referer" });
  }

  if (!isTrustedOrigin(candidateOrigin)) {
    return res.status(403).json({ error: "Untrusted Origin/Referer" });
  }

  next();
};

const getSupportedNetwork = (network: networkName) => {
  return Object.values(SUPPORTED_NETWORKS).find(
    (item) => item.name === network
  );
};

export const getDocumentData = (
  document: OpenAttestationDocument | SignedVerifiableCredential
): any => {
  if (isRawV3Document(document) || vc.isSignedDocument(document)) {
    return document.credentialSubject;
  } else {
    return document;
  }
};

export const validateNetwork = (
  document: SignedVerifiableCredential | WrappedOrSignedOpenAttestationDocument
) => {
  if (vc.isSignedDocument(document) || vc.isRawDocument(document)) {
    if (isTransferableRecord(document)) {
      const {
        credentialStatus: { tokenNetwork },
      } = (document as RawVerifiableCredential) ?? {};
      if (!tokenNetwork) {
        throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
      }
      return tokenNetwork;
    } else {
      return {};
    }
  } else if (isWrappedV2Document(document)) {
    const { network } = getDataV2(document);
    if (!network) {
      throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
    } else {
      return network;
    }
  } else if (isWrappedV3Document(document)) {
    const { network } = document;

    if (!network) {
      throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
    } else {
      return network;
    }
  } else {
    throw new createError(400, ERROR_MESSAGE.DOCUMENT_SCHEMA_INVALID);
  }
};

export const validateDocument = async ({
  document,
  network,
}: {
  document: WrappedDocument<OpenAttestationDocument>;
  network: networkName | undefined;
}) => {
  let fragments: VerificationFragment[];
  if (network) {
    const supportedNetwork = getSupportedNetwork(network);
    if (!supportedNetwork) {
      throw new createError(400, ERROR_MESSAGE.NETWORK_UNSUPPORTED);
    }
    fragments = await verifyDocument(document, {
      rpcProviderUrl: supportedNetwork.rpcUrl as string,
    });
  } else {
    fragments = await verifyDocument(document); // for non-transferable
  }
  if (!isValid(fragments)) {
    throw new createError(400, ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR);
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
