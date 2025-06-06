import supertest from "supertest";
import documentAstron from "../fixtures/v2/document-astron.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:5080/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postData = { document: documentAstron };

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
});
