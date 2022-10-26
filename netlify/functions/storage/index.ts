import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { checkApiKey, corsOrigin } from "../../utils";
import { create } from "./create";
import { createAtId } from "./createAtId";
import { get } from "./get";
import { queue } from "./queue";

const app = express();
const router = express.Router();

router.post("/", checkApiKey, create);
router.get("/queue", checkApiKey, queue);
router.get("/:id", get); // lets omit checkApiKey for tradetrust web to retrieve document easily
router.post("/:id", checkApiKey, createAtId);

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
app.use("/.netlify/functions/storage", router);

export const handler = serverless(app);
