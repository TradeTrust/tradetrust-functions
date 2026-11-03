import { CHAIN_ID } from "@trustvc/trustvc";
import { v4 as uuid } from "uuid";
import {
  validateNetwork,
  validateDocument,
  getEncryptedDocument,
} from "../../utils";
import {
  s3Get,
  s3GetIfExists,
  s3Put,
  s3PutConditional,
} from "../../services/s3";
import { SUPPORTED_NETWORKS } from "../../constants";
import {
  issueReservationId,
  keyForUpload,
  reservationKeyFor,
  writeHeadersForObserved,
} from "./reservationKey";

export const getDocument = async (id: string) => {
  const document = await s3Get({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
  });

  return document;
};

export const uploadDocument = async (document) => {
  const { chainId } = await validateNetwork(document);
  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID]?.name,
  });
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
    });
  const id = uuid();
  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
    Body: JSON.stringify({ document: encryptedDocument }),
  });

  return {
    id,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const uploadDocumentAtId = async (document, documentId: string) => {
  const observed = await s3GetIfExists({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: documentId,
  });
  const existingKey = keyForUpload(observed?.body, documentId);

  const { chainId } = await validateNetwork(document);

  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID]?.name,
  });
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
      existingKey,
    });

  await s3PutConditional(
    {
      Bucket: process.env.TT_AWS_BUCKET_NAME,
      Key: documentId,
      Body: JSON.stringify({ document: encryptedDocument }),
    },
    writeHeadersForObserved(observed == null ? null : { etag: observed.etag })
  );

  return {
    id: documentId,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

// One call per document. A batch issues many of these before signing and upload.
// The key is derived from the id, so nothing is stored until the document is uploaded.
export const getQueueNumber = async () => {
  const id = issueReservationId();
  return { key: reservationKeyFor(id), id };
};
