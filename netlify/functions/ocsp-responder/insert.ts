import {
  DYNAMODB_TABLE,
  OCSP_RESPONDER_SUCCESS_MESSAGE,
} from "../../constants";
import { normalizeHash } from "../../utils";
import { dynamoDbClient } from "../../services/dynamoDb";

export const insert = async (req, res) => {
  const { documentHash } = req.body;
  const hash = normalizeHash(documentHash);

  try {
    await dynamoDbClient
      .put({
        TableName: DYNAMODB_TABLE.REVOCATION,
        Item: {
          documentHash: hash,
          createdAt: new Date().toISOString(),
        },
      })
      .promise();

    res.status(200).json({
      success: true,
      message: OCSP_RESPONDER_SUCCESS_MESSAGE.ADDED,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
