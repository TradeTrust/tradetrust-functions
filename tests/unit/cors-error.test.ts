import express from "express";
import cors from "cors";
import request from "supertest";
import { corsOrigin, errorHandler } from "../../netlify/utils";
import { ERROR_MESSAGE } from "../../netlify/constants";

const app = express();
app.use(cors({ origin: corsOrigin, credentials: true }));
app.get("/ok", (_req, res) => res.json({ ok: true }));
app.get("/boom", () => {
  throw new Error("secret internals");
});
app.use(errorHandler);

describe("CORS rejection and error handler", () => {
  it("rejects a look-alike origin with 403 and no stack trace", async () => {
    const res = await request(app)
      .get("/ok")
      .set("Origin", "https://tradetrust.io.evil.com");
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: ERROR_MESSAGE.CORS_UNALLOWED });
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
    expect(res.text).not.toMatch(/at corsOrigin/);
  });

  it("allows a trusted origin with credentials", async () => {
    const res = await request(app)
      .get("/ok")
      .set("Origin", "https://www.tradetrust.io");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.tradetrust.io"
    );
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("hides internal error details", async () => {
    const res = await request(app).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});
