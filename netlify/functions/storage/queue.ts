import { v4 as uuid } from "uuid";
import { generateEncryptionKey } from "@govtechsg/oa-encryption";
import { s3Put } from "../../services/s3";

const getQueueNumber = async () => {
  const id = uuid();
  const encryptionKey = generateEncryptionKey();

  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
    Body: JSON.stringify({
      key: encryptionKey,
    }),
  });

  return { key: encryptionKey, id };
};

export const queue = async (req, res) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};
