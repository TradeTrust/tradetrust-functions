import { s3Get } from "../../services/s3";

export const getDocument = async (id: string) => {
  const document = await s3Get({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: id,
  });

  return document;
};

export const get = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const { document } = await getDocument(id);

    res.status(200).json(document);
  } catch (err) {
    res.status(400).json(err);
  }
};
