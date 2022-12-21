import supertest from "supertest";
import documentGoerliV2 from "../fixtures/v2/document-goerli.json";
import documentMainnetV2 from "../fixtures/v2/document-mainnet.json";
import documentMaticmumV2 from "../fixtures/v2/document-maticmum.json";
import documentSepoliaV2 from "../fixtures/v2/document-sepolia.json";
import documentGoerliV3 from "../fixtures/v3/document-goerli.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const RESPONSE_VERIFY_SUCCESS_SUMMARY = {
  all: true,
  documentStatus: true,
  documentIntegrity: true,
  issuerIdentity: true,
};

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/verify";
const request = supertest(API_ENDPOINT);
const postDataGoerliV2 = { document: documentGoerliV2 };
const postDataMainnnetV2 = { document: documentMainnetV2 };
const postDataMaticmumV2 = { document: documentMaticmumV2 };
const postDataSepoliaV2 = { document: documentSepoliaV2 };
const postDataGoerliV3 = { document: documentGoerliV3 };

describe("POST /", () => {
  it("should verify a mainnet document by default", async () => {
    const response = await request
      .post("/")
      .send(postDataMainnnetV2)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document by default", async () => {
    const response = await request.post("/").send(postDataGoerliV2).expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR);
  });

  it("should verify a v2 goerli document with goerli network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "goerli" })
      .send(postDataGoerliV2)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should verify a v3 goerli document with goerli network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "goerli" })
      .send(postDataGoerliV3)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document with unsupported network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "foo" })
      .send(postDataGoerliV2)
      .expect(400);

    expect(response.body.message).toStrictEqual(
      ERROR_MESSAGE.NETWORK_UNSUPPORTED,
    );
  });

  it("should verify a maticmum document", async () => {
    const response = await request
      .post("/")
      .query({ network: "maticmum" })
      .send(postDataMaticmumV2)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should verify a sepolia document", async () => {
    const response = await request
      .post("/")
      .query({ network: "sepolia" })
      .send(postDataSepoliaV2)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
});
