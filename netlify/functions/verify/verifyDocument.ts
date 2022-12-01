import { isValid } from "@govtechsg/oa-verify";
import { validateDocument } from "../../utils";

export const verifyDocument = async (req, res) => {
  const {
    body: { document },
    query: { network = "mainnet" },
  } = req;

  try {
    const fragments = await validateDocument({
      document,
      network,
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
};
