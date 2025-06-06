import supertest from "supertest";
import documentAmoyV2 from "../fixtures/v2/document-amoy.json";
import documentAmoyV3 from "../fixtures/v3/document-amoy.json";
import documentXDCApothemV2 from "../fixtures/v2/document-xdcapothem.json";
import documentXDCApothemV3 from "../fixtures/v3/document-xdcapothem.json";
import documentSepoliaV2 from "../fixtures/v2/document-sepolia.json";
import documentSepoliaV3 from "../fixtures/v3/document-sepolia.json";
import documentSepoliaNoNetworkV2 from "../fixtures/v2/document-sepolia-no-network.json";
import documentSepoliaNoNetworkV3 from "../fixtures/v3/document-sepolia-no-network.json";
import w3cTransferableDocument from "../fixtures/w3c/document-tr.json";
import w3cNonTransferableDocument from "../fixtures/w3c/document-non-transferable.json";
import {
  ERROR_MESSAGE,
  DOCUMENT_STORAGE_ERROR_MESSAGE,
} from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:5080/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postDataAmoyV2 = { document: documentAmoyV2 };
const postDataAmoyV3 = { document: documentAmoyV3 };
const postDataXDCApothemV2 = { document: documentXDCApothemV2 };
const postDataXDCApothemV3 = { document: documentXDCApothemV3 };
const postDataSepoliaV2 = { document: documentSepoliaV2 };
const postDataSepoliaV3 = { document: documentSepoliaV3 };
const postDataW3cTransferable = { document: w3cTransferableDocument };
const postDataW3cNonTransferable = { document: w3cNonTransferableDocument };

const csrfToken = "mock-csrf-token"; // Mocked CSRF token
const csrfTokenCookie = `csrfToken=${csrfToken}; HttpOnly; Path=/; SameSite=Strict`; // Mocked CSRF cookie

describe("POST /", () => {
  it("should store encrypted v2 amoy document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAmoyV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted v2 sepolia document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataSepoliaV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
  it("should store encrypted v2 xdcapothem document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataXDCApothemV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
  it("should store encrypted v3 sepolia document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataSepoliaV3)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted v3 amoy document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataAmoyV3)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
  it("should store encrypted v3 xdcapothem document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataXDCApothemV3)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted w3c stabilityTestnet transferable document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataW3cTransferable)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted w3c stabilityTestnet non-transferable document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send(postDataW3cNonTransferable)
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
        document: documentSepoliaNoNetworkV2,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND
    );
  });
  it("should throw error when v3 document's network field does not exists", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .set("x-csrf-token", csrfToken)
      .set("cookie", csrfTokenCookie)
      .send({
        document: documentSepoliaNoNetworkV3,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND
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
      .send(postDataSepoliaV2)
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
      DOCUMENT_STORAGE_ERROR_MESSAGE.KEY_NOT_EXISTS
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
      .send(postDataSepoliaV2)
      .expect(200);

    expect(response.body).toHaveProperty("id", queueResponse.body.id); // important to check!
    expect(response.body).toHaveProperty("key", queueResponse.body.key); // important to check!
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
});
