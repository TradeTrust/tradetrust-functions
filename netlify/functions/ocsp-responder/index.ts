import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { MAX_REQUEST_BODY_SIZE } from "../../constants";
import { corsOrigin, checkApiKey } from "../../utils";
import { insert } from "./insert";
import { get } from "./get";
import { scan } from "./scan";
import { remove } from "./remove";

const app = express();
const router = express.Router();

router.post("/", checkApiKey, insert);
router.get("/:documentHash", get);
router.get("/", checkApiKey, scan);
router.delete("/:documentHash", checkApiKey, remove);

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true }),
);
app.use("/.netlify/functions/ocsp-responder", router);

export const handler = serverless(app);
