import { providers } from "ethers";
import {
  CHAIN_ID,
  SUPPORTED_CHAINS,
  chainInfo,
} from "@govtechsg/tradetrust-utils/constants/supportedChains";

export const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "test"
    ? [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://creator.tradetrust.io",
        "https://dev.tradetrust.io",
        "https://tradetrust.io",
      ]
    : [
        "https://creator.tradetrust.io",
        "https://dev.tradetrust.io",
        "https://tradetrust.io",
      ];

export enum ERROR_MESSAGE {
  CORS_UNALLOWED = "The CORS policy for this site does not allow access from the specified Origin.",
  API_KEY_INVALID = "API key invalid.",
  DOCUMENT_NOT_FOUND = "Document not found.",
  DOCUMENT_GENERIC_ERROR = "Document invalid.",
  DOCUMENT_SCHEMA_INVALID = "Document is not OA compliant.",
  DOCUMENT_NETWORK_NOT_FOUND = "Document network not found.",
  NETWORK_UNSUPPORTED = "Network is unsupported.",
}

export enum DOCUMENT_STORAGE_ERROR_MESSAGE {
  KEY_NOT_EXISTS = "The specified key does not exist.",
}

export const MAX_REQUEST_BODY_SIZE = "6mb";

const infuraProvider =
  (networkName: string): (() => providers.Provider) =>
  () =>
    new providers.InfuraProvider(networkName);

const jsonRpcProvider =
  (url: string): (() => providers.Provider) =>
  () =>
    new providers.JsonRpcProvider(url);

type supportedNetworks = Record<
  CHAIN_ID,
  chainInfo & { provider: () => providers.Provider }
>;

export const SUPPORTED_NETWORKS: supportedNetworks = {
  [CHAIN_ID.local]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.local],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.local].rpcUrl),
  },
  [CHAIN_ID.mainnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.mainnet],
    provider: infuraProvider("homestead"),
  },
  [CHAIN_ID.matic]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.matic],
    provider: infuraProvider("matic"),
  },
  [CHAIN_ID.maticmum]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.maticmum],
    provider: infuraProvider("maticmum"),
  },
  [CHAIN_ID.sepolia]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.sepolia],
    provider: infuraProvider("sepolia"),
  },
  [CHAIN_ID.xdc]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.xdc],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.xdc].rpcUrl),
  },
  [CHAIN_ID.xdcapothem]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.xdcapothem],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.xdcapothem].rpcUrl),
  },
};
