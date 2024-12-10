import supertest from "supertest";
import documentMainnetV2 from "../fixtures/v2/document-mainnet.json";
import documentAstronV2 from "../fixtures/v2/document-astron.json";
import documentAstronV3 from "../fixtures/v3/document-astron.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const RESPONSE_VERIFY_SUCCESS_SUMMARY = {
  all: true,
  documentStatus: true,
  documentIntegrity: true,
  issuerIdentity: true,
};

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/verify";
const request = supertest(API_ENDPOINT);
const postDataMainnetV2 = { document: documentMainnetV2 };
const postDataAstronV2 = { document: documentAstronV2 };
const postDataAstronV3 = { document: documentAstronV3 };

describe("POST /", () => {
  it("should verify a mainnet document by default", async () => {
    const response = await request
      .post("/")
      .send(postDataMainnetV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
  it("should not verify a astron document by default", async () => {
    const response = await request.post("/").send(postDataAstronV2).expect(400);
    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR);
  });
  it("should verify a v2 astron document with astron network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "astron" })
      .send(postDataAstronV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
  it("should verify a v3 astron document with astron network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "astron" })
      .send(postDataAstronV3)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
  it("should not verify a astron document with unsupported network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "foo" })
      .send(postDataAstronV2)
      .expect(400);
    expect(response.body.message).toStrictEqual(
      ERROR_MESSAGE.NETWORK_UNSUPPORTED,
    );
  });
  it("should verify a astron document", async () => {
    const response = await request
      .post("/")
      .query({ network: "astron" })
      .send(postDataAstronV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
});
