import express from "express";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { FUNCTIONS_PATH } from "../../constants";
import { checkApiKey } from "../../utils";
import { create } from "./create";
import { createAtId } from "./createAtId";
import { get } from "./get";
import { queue } from "./queue";

const app = express();
export const router = express.Router();

router.post("/", checkApiKey, create);
router.get("/queue", checkApiKey, queue);
router.get("/:id", checkApiKey, get);
router.post("/:id", checkApiKey, createAtId);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(FUNCTIONS_PATH, router);

export const handler = serverless(app);
