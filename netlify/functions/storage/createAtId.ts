import { CHAIN_ID } from "@govtechsg/tradetrust-utils/constants/supportedChains";
import {
  validateNetwork,
  validateDocument,
  getEncryptedDocument,
} from "../../utils";
import { getDocument } from "./get";
import { s3Put } from "../../services/s3";
import { SUPPORTED_NETWORKS } from "../../constants";

const uploadDocumentAtId = async (document, documentId: string) => {
  const { chainId } = await validateNetwork(document);

  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
  });

  const { key: existingKey } = await getDocument(documentId);
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
      existingKey,
    });

  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: documentId,
    Body: JSON.stringify({ document: encryptedDocument }),
  });

  return {
    id: documentId,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const createAtId = async (req, res) => {
  const {
    body: { document },
    params: { id },
  } = req;

  try {
    const result = await uploadDocumentAtId(document, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};
