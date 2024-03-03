import supertest from "supertest";
import documentMaticmumV2 from "../fixtures/v2/document-maticmum.json";
import documentMaticmumV3 from "../fixtures/v3/document-maticmum.json";
import documentXDCApothemV2 from "../fixtures/v2/document-xdcapothem.json";
import documentXDCApothemV3 from "../fixtures/v3/document-xdcapothem.json";
import documentSepoliaV2 from "../fixtures/v2/document-sepolia.json";
import documentSepoliaV3 from "../fixtures/v3/document-sepolia.json";
import documentSepoliaNoNetworkV2 from "../fixtures/v2/document-sepolia-no-network.json";
import documentSepoliaNoNetworkV3 from "../fixtures/v3/document-sepolia-no-network.json";
import documentHederaV2 from "../fixtures/v2/document-hedera.json";
import documentHederaV3 from "../fixtures/v3/document-hedera.json";
import documentHederaNoNetworkV2 from "../fixtures/v2/document-hedera-no-network.json";
import documentHederaNoNetworkV3 from "../fixtures/v3/document-hedera-no-network.json";
import documentStabilityV2 from "../fixtures/v2/document-stabilitytestnet.json";
import documentStabilityNoNetworkV2 from "../fixtures/v2/document-stabilitytestnet.json";
import {
  ERROR_MESSAGE,
  DOCUMENT_STORAGE_ERROR_MESSAGE,
} from "../../netlify/constants";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/storage";
const request = supertest(API_ENDPOINT);
const postDataMaticmumV2 = { document: documentMaticmumV2 };
const postDataMaticmumV3 = { document: documentMaticmumV3 };
const postDataXDCApothemV2 = { document: documentXDCApothemV2 };
const postDataXDCApothemV3 = { document: documentXDCApothemV3 };
const postDataSepoliaV2 = { document: documentSepoliaV2 };
const postDataSepoliaV3 = { document: documentSepoliaV3 };
const postDataHederaV2 = { document: documentHederaV2 };
const postDataHederaV3 = { document: documentHederaV3 };
const postDataStabilityV2 = { document: documentStabilityV2 };

describe("POST /", () => {
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
  it("should store encrypted v2 hedera document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataHederaV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
  it("should store encrypted v2 stability document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataStabilityV2)
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
      .send(postDataXDCApothemV2)
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("key");
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
  it("should store encrypted v3 hedera document", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send(postDataHederaV3)
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
      .send(postDataSepoliaV3)
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
      .send(postDataMaticmumV3)
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
      .send(postDataXDCApothemV3)
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

  it("should throw error when v2 document's network field does not exists", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: documentSepoliaNoNetworkV2,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND
    );
  });
  it("should throw error when v2 document's network field does not exists for hedera", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: documentHederaNoNetworkV2,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND
    );
  });
  it("should throw error when v2 document's network field does not exists for stability", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: documentStabilityNoNetworkV2,
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
      .send({
        document: documentSepoliaNoNetworkV3,
      })
      .expect(400);

    expect(response.body.message).toBe(
      ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND
    );
  });
  it("should throw error when v3 document's network field does not exists for hedera", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        document: documentHederaNoNetworkV3,
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
      .send(postDataSepoliaV2)
      .expect(200);

    expect(response.body).toHaveProperty("id", queueResponse.body.id); // important to check!
    expect(response.body).toHaveProperty("key", queueResponse.body.key); // important to check!
    expect(response.body).toHaveProperty("type", "OPEN-ATTESTATION-TYPE-1");
    expect(Object.keys(response.body).length).toBe(3);
  });
});
