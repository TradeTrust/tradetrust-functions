import {
  DYNAMODB_TABLE,
  OCSP_RESPONDER_REVOCATION_REASON,
} from "../../constants";
import { normalizeHash } from "../../utils";
import { dynamoDbClient } from "../../services/dynamoDb";

export const get = async (req, res) => {
  const {
    params: { documentHash },
  } = req;
  const hash = normalizeHash(documentHash);

  try {
    const result = await dynamoDbClient
      .get({
        TableName: DYNAMODB_TABLE.REVOCATION,
        Key: {
          documentHash: hash,
        },
      })
      .promise();

    if (Object.entries(result).length === 0 && result.constructor === Object) {
      res.status(200).json({
        revoked: false,
        documentHash: hash,
      });
    } else {
      res.status(200).json({
        revoked: true,
        documentHash: hash,
        reasonCode: OCSP_RESPONDER_REVOCATION_REASON.AFFILIATION_CHANGED, // this response shape is required from oa-verify guard -> https://github.com/Open-Attestation/oa-verify/blob/9638ba5285dc85fc294283c5e5e531debaaa5c4b/src/verifiers/documentStatus/didSigned/didSignedDocumentStatus.type.ts#L44-L79
      });
    }
  } catch (err) {
    res.status(400).json(err);
  }
};
