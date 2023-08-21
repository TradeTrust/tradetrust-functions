import { providers } from "ethers";
import {
  CHAIN_ID,
  SUPPORTED_CHAINS,
  chainInfo,
} from "@govtechsg/tradetrust-utils/constants/supportedChains";

export const ALLOWED_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://creator.tradetrust.io",
  "https://dev.tradetrust.io",
  "https://tradetrust.io",
];

export enum DYNAMODB_TABLE {
  REVOCATION = "tradetrust-dev-ocsp-responder",
}

// https://datatracker.ietf.org/doc/html/rfc5280#page-69
export enum OCSP_RESPONDER_REVOCATION_REASON {
  UNSPECIFIED = 0,
  KEY_COMPROMISE = 1,
  CA_COMPROMISE = 2,
  AFFILIATION_CHANGED = 3,
  SUPERSEDED = 4,
  CESSATION_OF_OPERATION = 5,
  CERTIFICATE_HOLD = 6,
  REMOVE_FROM_CRL = 8,
  PRIVILEGE_WITHDRAWN = 9,
  A_A_COMPROMISE = 10,
}

export enum OCSP_RESPONDER_SUCCESS_MESSAGE {
  ADDED = "documentHash added into revocation table.",
  REMOVED = "documentHash removed from revocation table.",
}

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
  [CHAIN_ID.goerli]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.goerli],
    provider: infuraProvider("goerli"),
  },
  [CHAIN_ID.sepolia]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.sepolia],
    provider: infuraProvider("sepolia"),
  },
};
