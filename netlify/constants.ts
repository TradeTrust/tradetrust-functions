import "dotenv/config";
import { providers } from "ethers";
import { SUPPORTED_CHAINS, CHAIN_ID, chainInfo } from "@trustvc/trustvc";

const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TRUSTED_APEX_HOST = "tradetrust.io";
const NETLIFY_SITE_HOST = "tradetrust-website.netlify.app";
// Netlify branch deploys and deploy previews use one label, then "--", then the site host.
const NETLIFY_PREVIEW_HOST =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?--tradetrust-website\.netlify\.app$/;

const isDnsHostname = (hostname: string): boolean =>
  hostname.split(".").every((label) => DNS_LABEL.test(label));

const isHostOrSubdomain = (hostname: string, apex: string): boolean =>
  hostname === apex ||
  (hostname.endsWith(`.${apex}`) && isDnsHostname(hostname));

// Shared by credentialed CORS and the Origin/Referer guard.
// tradetrust.io must be the apex or a dot-separated subdomain.
// The Netlify site must be that exact host, or a single-label preview
// (deploy-preview-1--tradetrust-website.netlify.app). A trusted name glued
// onto another domain, or a free-host name that merely contains it, does not match.
export const isAllowedBrowserOrigin = (origin: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.username !== "" || parsed.password !== "") return false;
  if (parsed.port !== "") return false;
  if (parsed.origin !== origin) return false;

  const hostname = parsed.hostname;
  if (isHostOrSubdomain(hostname, TRUSTED_APEX_HOST)) return true;
  if (hostname === NETLIFY_SITE_HOST) return true;
  return NETLIFY_PREVIEW_HOST.test(hostname) && isDnsHostname(hostname);
};

export const LOCALHOST_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
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
  [CHAIN_ID.amoy]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.amoy],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.amoy].rpcUrl),
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
  [CHAIN_ID.stabilitytestnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.stabilitytestnet],
    provider: jsonRpcProvider(
      SUPPORTED_CHAINS[CHAIN_ID.stabilitytestnet].rpcUrl
    ),
  },
  [CHAIN_ID.stability]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.stability],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.stability].rpcUrl),
  },
  [CHAIN_ID.astron]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.astron],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.astron].rpcUrl),
  },
  [CHAIN_ID.astrontestnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.astrontestnet],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.astrontestnet].rpcUrl),
  },
};
