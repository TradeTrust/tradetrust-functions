import supertest from "supertest";
import documentMainnetV2 from "../fixtures/v2/document-mainnet.json";
import documentAmoyV2 from "../fixtures/v2/document-amoy.json";
import documentSepoliaV2 from "../fixtures/v2/document-sepolia.json";
import documentSepoliaV3 from "../fixtures/v3/document-sepolia.json";
import documentXDCApothemV2 from "../fixtures/v2/document-xdcapothem.json";
import documentXDCApothemV3 from "../fixtures/v3/document-xdcapothem.json";
import w3cTransferableDocument from "../fixtures/w3c/document-tr.json";
import w3cNonTransferableDocument from "../fixtures/w3c/document-non-transferable.json";
import { ERROR_MESSAGE } from "../../netlify/constants";

const RESPONSE_VERIFY_SUCCESS_SUMMARY = {
  all: true,
  documentStatus: true,
  documentIntegrity: true,
  issuerIdentity: true,
};

const API_ENDPOINT = "http://localhost:5080/.netlify/functions/verify";
const request = supertest(API_ENDPOINT);
const postDataMainnnetV2 = { document: documentMainnetV2 };
const postDataAmoyV2 = { document: documentAmoyV2 };
const postDataSepoliaV2 = { document: documentSepoliaV2 };
const postDataSepoliaV3 = { document: documentSepoliaV3 };
const postDataXDCApothemV2 = { document: documentXDCApothemV2 };
const postDataXDCApothemV3 = { document: documentXDCApothemV3 };
const postDataW3cTransferable = { document: w3cTransferableDocument };
const postDataW3cNonTransferable = { document: w3cNonTransferableDocument };

describe("POST /", () => {
  it("should verify a mainnet document by default", async () => {
    const response = await request
      .post("/")
      .send(postDataMainnnetV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should not verify a sepolia document by default", async () => {
    const response = await request
      .post("/")
      .send(postDataSepoliaV2)
      .expect(400);
    expect(response.body.message).toBe(ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR);
  });
  it("should verify a v2 sepolia document with sepolia network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "sepolia" })
      .send(postDataSepoliaV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a v3 sepolia document with xdcapothem network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "xdcapothem" })
      .send(postDataXDCApothemV3)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a v3 sepolia document with sepolia network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "sepolia" })
      .send(postDataSepoliaV3)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should not verify a sepolia document with unsupported network query", async () => {
    const response = await request
      .post("/")
      .query({ network: "foo" })
      .send(postDataSepoliaV2)
      .expect(400);
    expect(response.body.message).toStrictEqual(
      ERROR_MESSAGE.NETWORK_UNSUPPORTED
    );
  });
  it("should verify a amoy document", async () => {
    const response = await request
      .post("/")
      .query({ network: "amoy" })
      .send(postDataAmoyV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a xdcapothem document", async () => {
    const response = await request
      .post("/")
      .query({ network: "xdcapothem" })
      .send(postDataXDCApothemV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a sepolia document", async () => {
    const response = await request
      .post("/")
      .query({ network: "sepolia" })
      .send(postDataSepoliaV2)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a stabilitytestnet w3c document", async () => {
    const response = await request
      .post("/")
      .query({ network: "stabilitytestnet" })
      .send(postDataW3cTransferable)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
  it("should verify a w3c non-transferable document", async () => {
    const response = await request
      .post("/")
      .send(postDataW3cNonTransferable)
      .expect(200);
    expect(response.body.summary).toStrictEqual(
      RESPONSE_VERIFY_SUCCESS_SUMMARY
    );
  });
});
