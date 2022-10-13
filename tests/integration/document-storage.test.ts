import supertest from "supertest";
import * as postData from "../fixtures/post-data.json";
import { ERROR_MESSAGE, S3_ERROR_MESSAGE } from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);

describe("POST /", () => {
  it("should store encrypted document", async () => {
    const response = await request.post("/").send(postData).expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should throw error when document verification failed", async () => {
    const response = await request
      .post("/")
      .send({
        document: { foo: "bar" },
      })
      .expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_INVALID);
  });
});

describe("GET /queue", () => {
  it("should retrieve s3 object id + oa encryption key", async () => {
    const response = await request.get("/queue").expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(Object.keys(response.body).length).toBe(2);
  });
});

describe("GET /:id", () => {
  it("should retrieve encrypted document without key", async () => {
    const postResponse = await request.post("/").send(postData).expect(200);

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
  it("store a new encrypted document, using retrieved key from specified id of previous queue", async () => {
    const queueResponse = await request.get("/queue").expect(200);

    const response = await request
      .post(`/${queueResponse.body.id}`)
      .send(postData)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key", queueResponse.body.key);
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
});
