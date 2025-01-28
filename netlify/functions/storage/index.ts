import express from "express";
import session from "express-session";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { corsOrigin } from "../../utils";
import { MAX_REQUEST_BODY_SIZE } from "../../constants";
import { router } from "./router";

const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Ensure the cookie is only sent over HTTPS connections
      httpOnly: true, // Make sure the cookie is not accessible via JavaScript (adds protection against XSS attacks)
      sameSite: "None", // To allow cross-origin cookies
      maxAge: 1000 * 60 * 60, // Cookie expiration time: 1 hour
    },
  }),
);
app.use("/.netlify/functions/storage", router);
app.disable("x-powered-by");

export const handler = serverless(app);
