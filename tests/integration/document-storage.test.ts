import supertest from "supertest";
import * as postData from "../fixtures/post-data.json";
import { ERROR_MESSAGE, S3_ERROR_MESSAGE } from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);

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

describe("POST /", () => {
  it("should store encrypted document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postData)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should throw error when document verification failed", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: { foo: "bar" },
      })
      .expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_INVALID);
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
      .send(postData)
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

    expect(response.body.message).toBe(S3_ERROR_MESSAGE.KEY_NOT_EXISTS);
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
      .send(postData)
      .expect(200);

    expect(response.body).toHaveProperty("id", queueResponse.body.id); // important to check!
    expect(response.body).toHaveProperty("key", queueResponse.body.key); // important to check!
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
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
      .set("Origin", "https://creator.tradetrust.io")
      .send(postData)
      .expect(200);
  });

  it("should pass with 200 when origin is TradeTrust testnets website", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("Origin", "https://dev.tradetrust.io")
      .send(postData)
      .expect(200);
  });

  it("should pass with 200 when origin is TradeTrust production website", async () => {
    await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("Origin", "https://tradetrust.io")
      .send(postData)
      .expect(200);
  });
});
