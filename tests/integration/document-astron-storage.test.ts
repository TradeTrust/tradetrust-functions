import supertest from "supertest";
import documentAstronV2 from "../fixtures/v2/document-astron.json";
import documentAstronV3 from "../fixtures/v3/document-astron.json";
import documentAstronNoNetworkV2 from "../fixtures/v2/document-astron-no-network.json";
import documentAstronNoNetworkV3 from "../fixtures/v3/document-astron-no-network.json";

import {
  ERROR_MESSAGE,
  DOCUMENT_STORAGE_ERROR_MESSAGE,
} from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postDataAstronV2 = { document: documentAstronV2 };
const postDataAstronV3 = { document: documentAstronV3 };

const csrfToken = "mock-csrf-token"; // Mocked CSRF token
const csrfTokenCookie = `csrfToken=${csrfToken}; HttpOnly; Path=/; SameSite=Strict`; // Mocked CSRF cookie

describe("POST /", () => {
  it("should store encrypted v2 astron document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAstronV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted v3 astron document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAstronV3)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should throw error when document is not compliant to OA schema", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send({
        document: { foo: "bar" },
      })
      .expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_SCHEMA_INVALID);
  });

  it("should throw error when v2 document's network field does not exists", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send({
        document: documentAstronNoNetworkV2,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND,
    );
  });
  it("should throw error when v3 document's network field does not exists", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send({
        document: documentAstronNoNetworkV3,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND,
    );
  });
});

describe("GET /queue", () => {
  it("should retrieve s3 object id + oa encryption key", async () => {
    const response = await request
      .get("/queue")
      .set("x-api-key", process.env.API_KEY)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(Object.keys(response.body).length).toBe(2);
  });
});

describe("GET /:id", () => {
  it("should retrieve encrypted document without key", async () => {
    const postResponse = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAstronV2)
      .expect(200);

    const getResponse = await request
      .get(`/${postResponse.body.id}`)
      .expect(200);

    expect(getResponse.body).toHaveProperty("cipherText");
    expect(getResponse.body).toHaveProperty("iv");
    expect(getResponse.body).toHaveProperty("tag");
    expect(getResponse.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(getResponse.body).not.toHaveProperty("key"); // important to check!
    expect(Object.keys(getResponse.body).length).toBe(4);
  });

  it("should fail if id is not found in s3 objects", async () => {
    const response = await request.get("/abc").expect(400);

    expect(response.body.message).toBe(
      DOCUMENT_STORAGE_ERROR_MESSAGE.KEY_NOT_EXISTS,
    );
  });
});

describe("POST /:id", () => {
  it("store a new encrypted document, replacing specified id from previous queue while using the retrieved decrypt key", async () => {
    const queueResponse = await request
      .get("/queue")
      .set("x-api-key", process.env.API_KEY)
      .expect(200);

    const response = await request
      .post(`/${queueResponse.body.id}`)
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAstronV2)
      .expect(200);

    expect(response.body).toHaveProperty("id", queueResponse.body.id); // important to check!
    expect(response.body).toHaveProperty("key", queueResponse.body.key); // important to check!
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
});
