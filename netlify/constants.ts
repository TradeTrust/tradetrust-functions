import { providers } from "ethers";

export const ALLOWED_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
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

export enum CHAIN_ID {
  MAINNET = 1,
  MATIC = 137,
  MATICMUM = 80001,
  GOERLI = 5,
  SEPOLIA = 11155111,
}

export type network = "mainnet" | "matic" | "maticmum" | "goerli" | "sepolia";

type SupportedNetworks = {
  [index in CHAIN_ID]: {
    label: string;
    network: network;
    type: "production" | "test";
    provider: () => providers.Provider;
  };
};

export const SUPPORTED_NETWORKS: SupportedNetworks = {
  [CHAIN_ID.MAINNET]: {
    label: "Mainnet",
    network: "mainnet",
    type: "production",
    provider: infuraProvider("homestead"),
  },
  [CHAIN_ID.MATIC]: {
    label: "Polygon",
    network: "matic",
    type: "production",
    provider: infuraProvider("matic"),
  },
  [CHAIN_ID.MATICMUM]: {
    label: "Polygon Mumbai",
    network: "maticmum",
    type: "test",
    provider: infuraProvider("maticmum"),
  },
  [CHAIN_ID.GOERLI]: {
    label: "Goerli",
    network: "goerli",
    type: "test",
    provider: infuraProvider("goerli"),
  },
  [CHAIN_ID.SEPOLIA]: {
    label: "Sepolia",
    network: "sepolia",
    type: "test",
    provider: jsonRpcProvider("https://rpc.sepolia.org"),
  },
};
