import {
  isValid,
  WrappedDocument,
  OpenAttestationDocument,
  networkName,
  isWrappedV2Document,
  getDataV2,
  isWrappedV3Document,
  vc,
  getDocumentData,
  verifyDocument,
} from "@trustvc/trustvc";

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

const getSupportedNetwork = (network: networkName) => {
  return Object.values(SUPPORTED_NETWORKS).find(
    (item) => item.name === network
  );
};

export const validateNetwork = (
  document: WrappedDocument<OpenAttestationDocument>
) => {
  if (vc.isSignedDocument(document) || vc.isRawDocument(document)) {
    const { network } = getDocumentData(document);
    if (!network) {
      throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
    } else {
      return network;
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
  network: networkName;
}) => {
  const supportedNetwork = getSupportedNetwork(network);
  if (!supportedNetwork) {
    throw new createError(400, ERROR_MESSAGE.NETWORK_UNSUPPORTED);
  }

  const fragments = await verifyDocument(document, {
    rpcProviderUrl: supportedNetwork.rpcUrl as string,
  });
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
