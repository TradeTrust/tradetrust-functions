import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { FUNCTIONS_PATH } from "../../constants";
import { checkApiKey, corsOrigin } from "../../utils";
import { create } from "./create";
import { createAtId } from "./createAtId";
import { get } from "./get";
import { queue } from "./queue";

const app = express();
export const router = express.Router();

router.post("/", create);
router.get("/queue", queue);
router.get("/:id", get);
router.post("/:id", createAtId);

app.use(cors({ origin: corsOrigin }));
app.use(checkApiKey);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(FUNCTIONS_PATH, router);

export const handler = serverless(app);
