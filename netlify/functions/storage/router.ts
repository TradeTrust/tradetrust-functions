import express, { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGE } from "../../constants";
import { checkApiKey, originReferrerGuard } from "../../utils";
import {
  uploadDocument,
  uploadDocumentAtId,
  getQueueNumber,
  getDocument,
} from "./helpers";
import { csrfSync } from "csrf-sync";

const router = express.Router();

const httpErrorStatus = (value: unknown): number | undefined =>
  typeof value === "number" && value >= 400 && value <= 599 ? value : undefined;

// Explicit HTTP errors, including reservation 403 and 409, keep their status.
// A storage error rethrown without one, such as from s3PutConditional, uses its
// 5xx statusCode so clients can retry. Anything else stays a client error.
export const responseStatus = (err: unknown): number => {
  if (typeof err !== "object" || err === null) return 400;
  const candidate = err as { status?: unknown; statusCode?: unknown };
  const explicit = httpErrorStatus(candidate.status);
  if (explicit !== undefined) return explicit;
  const backend = httpErrorStatus(candidate.statusCode);
  if (backend !== undefined && backend >= 500) return backend;
  return 400;
};

// http-errors marks client errors as exposed. S3 and other unexpected errors are not.
const clientSafeMessage = (err: unknown): string | undefined => {
  if (typeof err !== "object" || err === null) return undefined;
  const candidate = err as { expose?: unknown; message?: unknown };
  return candidate.expose === true && typeof candidate.message === "string"
    ? candidate.message
    : undefined;
};

export const uploadErrorResponse = (
  err: unknown
): { status: number; message: string; log: boolean } => {
  const status = responseStatus(err);
  const safe = clientSafeMessage(err);
  return {
    status,
    log: safe === undefined,
    message:
      safe ??
      (status >= 500
        ? "Internal Server Error"
        : ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR),
  };
};

// Initialize csrfSyncProtection with necessary options for CSRF token handling
const csrfSyncProtection = csrfSync({
  // Function to get the token from the state
  getTokenFromState: (req) => {
    return req.cookies.csrfToken; // Get CSRF token from cookies
  },

  // Function to get the token from the request
  getTokenFromRequest: (req) => {
    return req.headers["x-csrf-token"]?.toString(); // Get CSRF token from X-CSRF-Token header
  },

  // Function to store the token in the request state (e.g., req.csrfToken)
  storeTokenInState: (req, token) => {
    req.csrfToken = token; // Store CSRF token in the request object
  },

  size: 32, // Token size for CSRF protection (default is 32)
});

// Route to generate and send CSRF token to the client
router.get(
  "/csrf-token",
  originReferrerGuard,
  checkApiKey,
  (req: Request, res: Response) => {
    // Generate CSRF token using csrfSyncProtection
    const token = csrfSyncProtection.generateToken(req);

    // Set the CSRF token in the response cookie (for automatic sending by the browser)
    res.cookie("csrfToken", token, {
      httpOnly: true, // Ensure the cookie is not accessible via JavaScript
      secure: true, // Use secure cookies (only sent over HTTPS)
      sameSite: "None", // To allow cross-origin cookies
      path: "/.netlify/functions/storage", // Scope to storage function path
      maxAge: 1000 * 60 * 60, // Cookie will expire in 1 hour
    });

    res.set("Cache-Control", "no-store");

    // Send the CSRF token in the response JSON body as well
    res.json({
      csrfToken: token,
    });
  }
);

// Middleware to validate the CSRF token on each request
const csrfValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if this is an M2M request (no Origin/Referer headers)
  const originHeader = req.headers.origin as string | undefined;
  const refererHeader = req.headers.referer as string | undefined;
  const apiKey = req.headers["x-api-key"] as string | undefined;

  // If no Origin/Referer and valid API key, skip CSRF validation (M2M request)
  if (!originHeader && !refererHeader && apiKey === process.env.API_KEY) {
    return next();
  }

  // Extract the CSRF token from the request header
  const tokenFromRequest = req.headers["x-csrf-token"]?.toString();

  // Extract the CSRF token from the cookie
  const tokenFromCookie = req.cookies.csrfToken;

  // Check if either token is missing or they don't match
  if (
    !tokenFromRequest ||
    !tokenFromCookie ||
    tokenFromRequest !== tokenFromCookie
  ) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" }); // Reject request if tokens don't match
  }

  next();
};

// Protected routes with CSRF validation for posting documents
router.post(
  "/",
  checkApiKey,
  originReferrerGuard,
  csrfValidationMiddleware,
  async (req: Request, res: Response) => {
    const {
      body: { document },
    } = req;
    try {
      const result = await uploadDocument(document);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Protected routes with CSRF validation for posting documents to a specific ID
router.post(
  "/:id",
  checkApiKey,
  originReferrerGuard,
  csrfValidationMiddleware,
  async (req: Request, res: Response) => {
    const {
      body: { document },
      params: { id },
    } = req;

    try {
      const result = await uploadDocumentAtId(document, id);
      res.status(200).json(result);
    } catch (err) {
      const failure = uploadErrorResponse(err);
      if (failure.log) {
        console.error("Unhandled error:", {
          status: failure.status,
          name: err instanceof Error ? err.name : undefined,
          message: err instanceof Error ? err.message : undefined,
          stack: err instanceof Error ? err.stack : undefined,
        });
      }
      res.status(failure.status).json({ message: failure.message });
    }
  }
);

router.get("/queue", checkApiKey, async (_req: Request, res: Response) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error retrieving queue number:", err);
    res
      .status(responseStatus(err))
      .json({ message: "Unable to retrieve queue number." });
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
