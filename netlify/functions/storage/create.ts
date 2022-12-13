import { v4 as uuid } from "uuid";
import { validateDocument, getEncryptedDocument } from "../../utils";
import { s3Put } from "../../services/s3";
import { SUPPORTED_NETWORKS, CHAIN_ID } from "../../constants";

const uploadDocument = async (document) => {
  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[CHAIN_ID.GOERLI].network,
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
