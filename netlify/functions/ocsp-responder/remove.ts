import {
  DYNAMODB_TABLE,
  OCSP_RESPONDER_SUCCESS_MESSAGE,
} from "../../constants";
import { normalizeHash } from "../../utils";
import { dynamoDbClient } from "../../services/dynamoDb";

export const remove = async (req, res) => {
  const {
    params: { documentHash },
  } = req;
  const hash = normalizeHash(documentHash);

  try {
    await dynamoDbClient
      .delete({
        TableName: DYNAMODB_TABLE.REVOCATION,
        Key: {
          documentHash: hash,
        },
      })
      .promise();

    res.status(200).json({
      success: true,
      messsage: OCSP_RESPONDER_SUCCESS_MESSAGE.REMOVED,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
