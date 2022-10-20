import supertest from "supertest";
import goerliDocument from "../fixtures/post-data-goerli.json";
import mainnetDocument from "../fixtures/post-data-mainnet.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const RESPONSE_VERIFY_SUCCESS_SUMMARY = {
  all: true,
  documentStatus: true,
  documentIntegrity: true,
  issuerIdentity: true,
};

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/verify";
const request = supertest(API_ENDPOINT);

describe("POST /", () => {
  it("should verify a mainnet document by default", async () => {
    const response = await request.post("/").send(mainnetDocument).expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document by default", async () => {
    const response = await request.post("/").send(goerliDocument).expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_INVALID);
  });

  it("should verify a goerli document with goerli network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "goerli" })
      .send(goerliDocument)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document with unsupported network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "foo" })
      .send(goerliDocument)
      .expect(400);

    expect(response.body.message).toStrictEqual(
      ERROR_MESSAGE.NETWORK_UNSUPPORTED,
    );
  });
});
