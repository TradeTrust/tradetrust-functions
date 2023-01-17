import { CHAIN_ID } from "@govtechsg/tradetrust-utils/constants/supportedChains";
import { v4 as uuid } from "uuid";
import {
  validateNetwork,
  validateDocument,
  getEncryptedDocument,
} from "../../utils";
import { s3Put } from "../../services/s3";
import { SUPPORTED_NETWORKS } from "../../constants";

const uploadDocument = async (document) => {
  const { chainId } = await validateNetwork(document);

  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
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

export const create = async (req, res) => {
  const {
    body: { document },
  } = req;

  try {
    const result = await uploadDocument(document);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};
