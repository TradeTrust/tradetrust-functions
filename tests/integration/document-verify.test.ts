import supertest from "supertest";
import documentGoerli from "../fixtures/v2/document-goerli.json";
import documentMainnet from "../fixtures/v2/document-mainnet.json";
import documentMaticmum from "../fixtures/v2/document-maticmum.json";
import documentSepolia from "../fixtures/v2/document-sepolia.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const RESPONSE_VERIFY_SUCCESS_SUMMARY = {
  all: true,
  documentStatus: true,
  documentIntegrity: true,
  issuerIdentity: true,
};

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/verify";
const request = supertest(API_ENDPOINT);
const postDataGoerli = { document: documentGoerli };
const postDataMainnnet = { document: documentMainnet };
const postDataMaticmum = { document: documentMaticmum };
const postDataSepolia = { document: documentSepolia };

describe("POST /", () => {
  it("should verify a mainnet document by default", async () => {
    const response = await request.post("/").send(postDataMainnnet).expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document by default", async () => {
    const response = await request.post("/").send(postDataGoerli).expect(400);

    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_INVALID);
  });

  it("should verify a goerli document with goerli network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "goerli" })
      .send(postDataGoerli)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should not verify a goerli document with unsupported network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "foo" })
      .send(postDataGoerli)
      .expect(400);

    expect(response.body.message).toStrictEqual(
      ERROR_MESSAGE.NETWORK_UNSUPPORTED,
    );
  });

  it("should verify a maticmum document", async () => {
    const response = await request
      .post("/")
      .query({ network: "maticmum" })
      .send(postDataMaticmum)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });

  it("should verify a sepolia document", async () => {
    const response = await request
      .post("/")
      .query({ network: "sepolia" })
      .send(postDataSepolia)
      .expect(200);

    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY,
    );
  });
});
