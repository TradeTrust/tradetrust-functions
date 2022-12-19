import { DYNAMODB_TABLE } from "../../constants";
import { dynamoDbClient } from "../../services/dynamoDb";

export const scan = async (req, res) => {
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
};
