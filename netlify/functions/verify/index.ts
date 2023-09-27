import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { corsOrigin } from "../../utils";
import { MAX_REQUEST_BODY_SIZE } from "../../constants";
import { router } from "./router";

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true }),
);
app.use("/.netlify/functions/verify", router);
app.disable("x-powered-by");

export const handler = serverless(app);
