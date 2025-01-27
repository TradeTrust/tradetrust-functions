import express, { Request, Response, NextFunction } from "express";
import { checkApiKey } from "../../utils";
import {
  uploadDocument,
  uploadDocumentAtId,
  getQueueNumber,
  getDocument,
} from "./helpers";
import { csrfSync } from "csrf-sync";

const router = express.Router();

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
router.get("/csrf-token", (req, res) => {
  // Generate CSRF token using csrfSyncProtection
  const token = csrfSyncProtection.generateToken(req);

  // Set the CSRF token in the response cookie (for automatic sending by the browser)
  res.cookie("csrfToken", token, {
    httpOnly: true, // Ensure the cookie is not accessible via JavaScript
    secure: true, // Use secure cookies (only sent over HTTPS)
    sameSite: "Strict", // Prevent the cookie from being sent in cross-site requests
    maxAge: 1000 * 60 * 60, // Cookie will expire in 1 hour
  });

  // Send the CSRF token in the response JSON body as well
  res.json({
    csrfToken: token,
  });
});

// Middleware to validate the CSRF token on each request
const csrfValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  },
);

// Protected routes with CSRF validation for posting documents to a specific ID
router.post(
  "/:id",
  checkApiKey,
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
      res.status(400).json(err);
    }
  },
);

router.get("/queue", checkApiKey, async (req: Request, res: Response) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
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
