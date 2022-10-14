export const FUNCTIONS_PATH = "/.netlify/functions/storage";

export const ALLOWED_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://creator.tradetrust.io",
  "https://dev.tradetrust.io",
  "https://www.tradetrust.io",
  "https://tradetrust.io",
];

export enum ERROR_MESSAGE {
  CORS_UNALLOWED = "The CORS policy for this site does not allow access from the specified Origin.",
  API_KEY_INVALID = "API key invalid.",
  DOCUMENT_INVALID = "Document invalid.",
  DOCUMENT_NOT_FOUND = "Document not found",
}

export enum S3_ERROR_MESSAGE {
  KEY_NOT_EXISTS = "The specified key does not exist.",
}
