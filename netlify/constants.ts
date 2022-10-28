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
  DOCUMENT_INVALID = "Document invalid.",
  DOCUMENT_NOT_FOUND = "Document not found.",
  NETWORK_UNSUPPORTED = "Network is unsupported.",
}

export enum S3_ERROR_MESSAGE {
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

export enum NETWORK {
  MAINNET = "mainnet",
  MATIC = "matic",
  MATICMUM = "maticmum",
  GOERLI = "goerli",
  SEPOLIA = "sepolia",
}

type SupportedNetworks = {
  [index in NETWORK]: {
    label: string;
    type: "production" | "test";
    provider: () => providers.Provider;
  };
};

export const SUPPORTED_NETWORKS: SupportedNetworks = {
  [NETWORK.MAINNET]: {
    label: "Mainnet",
    type: "production",
    provider: infuraProvider("homestead"),
  },
  [NETWORK.MATIC]: {
    label: "Polygon",
    type: "production",
    provider: infuraProvider("matic"),
  },
  [NETWORK.MATICMUM]: {
    label: "Polygon Mumbai",
    type: "test",
    provider: infuraProvider("maticmum"),
  },
  [NETWORK.GOERLI]: {
    label: "Goerli",
    type: "test",
    provider: infuraProvider("goerli"),
  },
  [NETWORK.SEPOLIA]: {
    label: "Sepolia",
    type: "test",
    provider: jsonRpcProvider("https://rpc.sepolia.org"),
  },
};
