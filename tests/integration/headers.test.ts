import supertest from "supertest";
import documentSepolia from "../fixtures/v3/document-sepolia.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:5080/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postData = { document: documentSepolia };

const csrfToken = "mock-csrf-token"; // Mocked CSRF token
const csrfTokenCookie = `csrfToken=${csrfToken}; HttpOnly; Path=/; SameSite=Strict`; // Mocked CSRF cookie

describe("API key check", () => {
  it("should fail with 400 when API key is not provided", async () => {
    const response = await request.post("/").send(postData).expect(400);
    expect(response.text).toBe(ERROR_MESSAGE.API_KEY_INVALID);
  });

  it("should fail with 400 when incorrect API key is provided", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", "incorrectKey")
      .send(postData)
      .expect(400);
    expect(response.text).toBe(ERROR_MESSAGE.API_KEY_INVALID);
  });
});

describe("csrf-token 304 CORS regression", () => {
  // Replicates the bug: browser caches /csrf-token (with its cookie), then sends
  // if-none-match on the next request. The cookie makes the server return the same
  // token → same ETag → 304. That 304 omits access-control-allow-origin, causing
  // the browser CORS check to fail even though the preflight passed.
  it("should return 200 with access-control-allow-origin even when if-none-match matches", async () => {
    const origin = "https://dev.tradetrust.io";

    // First request — get a valid ETag and the csrfToken cookie
    const first = await request
      .get("/csrf-token")
      .set("x-api-key", process.env.API_KEY)
      .set("Origin", origin)
      .expect(200);

    const etag = first.headers["etag"];

    // Extract the Set-Cookie header so the second request returns the same token
    // (same body → same ETag → would trigger 304 without the fix)
    const setCookieHeaders: string[] = [].concat(
      first.headers["set-cookie"] ?? []
    );
    const csrfCookie = setCookieHeaders
      .find((c) => c.startsWith("csrfToken="))
      ?.split(";")[0];
    expect(csrfCookie).toBeDefined();

    // Use the real ETag if present; otherwise simulate a stale browser-cached value.
    // Either way the server must return 200 — never 304.
    const ifNoneMatch = etag ?? 'W/"stale-browser-cached-etag"';

    // Second request — simulate the browser replaying its cached ETag plus the cookie
    const second = await request
      .get("/csrf-token")
      .set("x-api-key", process.env.API_KEY)
      .set("Origin", origin)
      .set("if-none-match", ifNoneMatch)
      .set("Cookie", csrfCookie);

    // Must never return 304 — that response omits access-control-allow-origin
    expect(second.status).not.toBe(304);
    expect(second.status).toBe(200);
    expect(second.headers["access-control-allow-origin"]).toBe(origin);
  });
});

describe("cors", () => {
  it("should fail with 500 when origin is unallowed", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("Origin", "http://foobar.com")
      .send(postData)
      .expect(500);
  });

  it("should pass with 200 when origin is TradeTrust creator", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .set("Origin", "https://creator.tradetrust.io")
      .send(postData)
      .expect(200);
  });

  it("should pass with 200 when origin is TradeTrust testnets website", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .set("Origin", "https://dev.tradetrust.io")
      .send(postData)
      .expect(200);
  });

  it("should pass with 200 when origin is TradeTrust production website", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .set("Origin", "https://tradetrust.io")
      .send(postData)
      .expect(200);
  });
  it("should pass with 200 when origin is TradeTrust production website", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .set("Origin", "https://www.tradetrust.io")
      .send(postData)
      .expect(200);
  });
  it("should pass with 200 when origin is https://ref.tradetrust.io", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .set("Origin", "https://ref.tradetrust.io")
      .send(postData)
      .expect(200);
  });
});
