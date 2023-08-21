import express, { Request, Response } from "express";
import {
  DYNAMODB_TABLE,
  OCSP_RESPONDER_SUCCESS_MESSAGE,
  OCSP_RESPONDER_REVOCATION_REASON,
} from "../../constants";
import { checkApiKey, normalizeHash } from "../../utils";
import { dynamoDbClient } from "../../services/dynamoDb";

const router = express.Router();

router.post("/", checkApiKey, async (req: Request, res: Response) => {
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
});

router.get("/", checkApiKey, async (req: Request, res: Response) => {
  try {
    const result = await dynamoDbClient
      .scan({
        TableName: DYNAMODB_TABLE.REVOCATION,
      })
      .promise();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete(
  "/:documentHash",
  checkApiKey,
  async (req: Request, res: Response) => {
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
  },
);

router.get("/:documentHash", async (req: Request, res: Response) => {
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
});

export { router };
