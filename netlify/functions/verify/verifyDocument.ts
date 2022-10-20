import { isValid } from "@govtechsg/oa-verify";
import createError from "http-errors";
import { validateDocument } from "../../utils";
import { ERROR_MESSAGE } from "../../constants";

const networkProduction = ["mainnet", "matic"];
const networkTestnet = ["local", "goerli", "sepolia", "maticmum"];
const networks = [...networkProduction, ...networkTestnet];

const getFragments = async ({ document, network }) => {
  if (!networks.includes(network)) {
    throw new createError(400, ERROR_MESSAGE.NETWORK_UNSUPPORTED);
  }

  return await validateDocument({
    document,
    network,
  });
};

export const verifyDocument = async (req, res) => {
  const {
    body: { document },
    query: { network = "mainnet" },
  } = req;

  try {
    const fragments = await getFragments({
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
