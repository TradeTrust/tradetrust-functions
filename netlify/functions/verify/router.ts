import express, { Request, Response } from "express";
import { networkName } from "@govtechsg/tradetrust-utils/constants/network";
import { isValid } from "@govtechsg/oa-verify";
import { validateDocument } from "../../utils";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const {
    body: { document },
    query: { network = "mainnet" },
  } = req;

  try {
    const fragments = await validateDocument({
      document,
      network: network as networkName,
    });
    res.status(200).json({
      summary: {
        all: isValid(fragments),
        documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
        documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
        issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"]),
      },
      fragments,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

export { router };
