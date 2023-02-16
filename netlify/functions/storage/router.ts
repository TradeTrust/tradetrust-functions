import express, { Request, Response } from "express";
import { checkApiKey } from "../../utils";
import {
  uploadDocument,
  uploadDocumentAtId,
  getQueueNumber,
  getDocument,
} from "./helpers";

const router = express.Router();

router.post("/", checkApiKey, async (req: Request, res: Response) => {
  const {
    body: { document },
  } = req;

  try {
    const result = await uploadDocument(document);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/:id", checkApiKey, async (req: Request, res: Response) => {
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
});

router.get("/queue", checkApiKey, async (req: Request, res: Response) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

// lets omit checkApiKey for tradetrust web to retrieve document easily
router.get("/:id", async (req: Request, res: Response) => {
  const {
    params: { id },
  } = req;

  try {
    const { document } = await getDocument(id);

    res.status(200).json(document);
  } catch (err) {
    res.status(400).json(err);
  }
});

export { router };
