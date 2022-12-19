import supertest from "supertest";
import documentGoerliV2 from "../fixtures/v2/document-goerli.json";
import documentMaticmumV2 from "../fixtures/v2/document-maticmum.json";
import documentSepoliaV2 from "../fixtures/v2/document-sepolia.json";
import documentGoerliV3 from "../fixtures/v3/document-goerli.json";
import documentGoerliNoNetwork from "../fixtures/v2/document-goerli-no-network.json";
import {
  ERROR_MESSAGE,
  DOCUMENT_STORAGE_ERROR_MESSAGE,
} from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postDataGoerliV2 = { document: documentGoerliV2 };
const postDataMaticmumV2 = { document: documentMaticmumV2 };
const postDataSepoliaV2 = { document: documentSepoliaV2 };
const postDataGoerliV3 = { document: documentGoerliV3 };

describe("POST /", () => {
  it("should store encrypted v2 goerli document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataGoerliV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted v2 maticmum document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataMaticmumV2)
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
      .send(postDataSepoliaV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });

  it("should store encrypted v3 goerli document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataGoerliV3)
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
      .send({
        document: { foo: "bar" },
      })
      .expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_SCHEMA_INVALID);
  });

  it("should throw error when document network field does not exists", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: documentGoerliNoNetwork,
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
      .send(postDataGoerliV2)
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
      .send(postDataGoerliV2)
      .expect(200);

    expect(response.body).toHaveProperty("id", queueResponse.body.id); // important to check!
    expect(response.body).toHaveProperty("key", queueResponse.body.key); // important to check!
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
});
