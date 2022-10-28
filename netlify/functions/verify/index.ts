import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { corsOrigin } from "../../utils";
import { verifyDocument } from "./verifyDocument";
import { MAX_REQUEST_BODY_SIZE } from "../../constants";

const app = express();
const router = express.Router();

router.post("/", verifyDocument);

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true }),
);
app.use("/.netlify/functions/verify", router);

export const handler = serverless(app);
