import supertest from "supertest";
import {
  openAttestationVerifiers,
  openAttestationDidIdentityProof,
  verificationBuilder,
} from "@govtechsg/oa-verify";
import {
  OCSP_RESPONDER_REVOCATION_REASON,
  SUPPORTED_NETWORKS,
} from "../../netlify/constants";
import documentRevoke from "../fixtures/v2/document-revoke.json";

const API_ENDPOINT = "http://localhost:9999/.netlify/functions/ocsp-responder";
const request = supertest(API_ENDPOINT);

const DOCUMENT_HASH =
  "0xf344aaae87e68f7cb8ba8dfa3b1c514377c89a38f8372ddbe7d44444acf343ae";

const verify = verificationBuilder(
  [...openAttestationVerifiers, openAttestationDidIdentityProof],
  {
    provider: SUPPORTED_NETWORKS[5].provider(),
  },
);

describe("POST /", () => {
  it("should add documentHash correctly", async () => {
    const response = await request
      .post("/")
      .set("x-api-key", process.env.API_KEY)
      .send({
        documentHash: DOCUMENT_HASH,
      })
      .expect(200);

    expect(response.body).toStrictEqual({
      success: true,
      message: "documentHash added into revocation table.",
    });
  });

  it("should verify a revoked document correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fragments = await verify(documentRevoke as any);

    expect(fragments).toStrictEqual([
      {
        data: true,
        name: "OpenAttestationHash",
        status: "VALID",
        type: "DOCUMENT_INTEGRITY",
      },
      {
        name: "OpenAttestationEthereumTokenRegistryStatus",
        reason: {
          code: 4,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
        },
        status: "SKIPPED",
        type: "DOCUMENT_STATUS",
      },
      {
        name: "OpenAttestationEthereumDocumentStoreStatus",
        reason: {
          code: 4,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "documentStore" or "certificateStore" property or DOCUMENT_STORE method',
        },
        status: "SKIPPED",
        type: "DOCUMENT_STATUS",
      },
      {
        data: {
          details: {
            issuance: [
              {
                did: "did:ethr:0x1245e5b64d785b25057f7438f715f4aa5d965733",
                issued: true,
              },
            ],
            revocation: [
              {
                address:
                  "http://localhost:9999/.netlify/functions/ocsp-responder",
                reason: {
                  code: 3,
                  codeString: "AFFILIATION_CHANGED",
                  message:
                    "Document 0xf344aaae87e68f7cb8ba8dfa3b1c514377c89a38f8372ddbe7d44444acf343ae has been revoked under OCSP Responder: http://localhost:9999/.netlify/functions/ocsp-responder",
                },
                revoked: true,
              },
            ],
          },
          issuedOnAll: true,
          revokedOnAny: true,
        },
        name: "OpenAttestationDidSignedDocumentStatus",
        reason: {
          code: 3,
          codeString: "AFFILIATION_CHANGED",
          message:
            "Document 0xf344aaae87e68f7cb8ba8dfa3b1c514377c89a38f8372ddbe7d44444acf343ae has been revoked under OCSP Responder: http://localhost:9999/.netlify/functions/ocsp-responder",
        },
        status: "INVALID",
        type: "DOCUMENT_STATUS",
      },
      {
        name: "OpenAttestationDnsTxtIdentityProof",
        reason: {
          code: 2,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
        },
        status: "SKIPPED",
        type: "ISSUER_IDENTITY",
      },
      {
        data: [
          {
            key: "did:ethr:0x1245e5b64d785b25057f7438f715f4aa5d965733#controller",
            location: "demo-tradetrust.openattestation.com",
            status: "VALID",
          },
        ],
        name: "OpenAttestationDnsDidIdentityProof",
        status: "VALID",
        type: "ISSUER_IDENTITY",
      },
      {
        name: "OpenAttestationDidIdentityProof",
        reason: {
          code: 0,
          codeString: "SKIPPED",
          message:
            "Document is not using DID as top level identifier or has not been wrapped",
        },
        status: "SKIPPED",
        type: "ISSUER_IDENTITY",
      },
    ]);
  });
});

describe("GET /:documentHash", () => {
  it("should get documentHash if exists correctly", async () => {
    const response = await request.get(`/${DOCUMENT_HASH}`).expect(200);

    expect(response.body).toStrictEqual({
      revoked: true,
      documentHash: DOCUMENT_HASH,
      reasonCode: OCSP_RESPONDER_REVOCATION_REASON.AFFILIATION_CHANGED,
    });
  });

  it("should get documentHash if not exists correctly", async () => {
    const response = await request.get(`/0x123`).expect(200);

    expect(response.body).toStrictEqual({
      revoked: false,
      documentHash: "0x123",
    });
  });
});

describe("GET /", () => {
  it("should get all documentHashes correctly", async () => {
    const response = await request
      .get(`/`)
      .set("x-api-key", process.env.API_KEY)
      .expect(200);

    expect(response.body.data.Items.length).toBe(1);
  });
});

describe("DELETE /", () => {
  it("should remove documentHash correctly", async () => {
    const response = await request
      .delete(`/${DOCUMENT_HASH}`)
      .set("x-api-key", process.env.API_KEY)
      .expect(200);

    expect(response.body).toStrictEqual({
      success: true,
      messsage: "documentHash removed from revocation table.",
    });
  });

  it("should verify an unrevoked document correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fragments = await verify(documentRevoke as any);

    expect(fragments).toStrictEqual([
      {
        data: true,
        name: "OpenAttestationHash",
        status: "VALID",
        type: "DOCUMENT_INTEGRITY",
      },
      {
        name: "OpenAttestationEthereumTokenRegistryStatus",
        reason: {
          code: 4,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
        },
        status: "SKIPPED",
        type: "DOCUMENT_STATUS",
      },
      {
        name: "OpenAttestationEthereumDocumentStoreStatus",
        reason: {
          code: 4,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "documentStore" or "certificateStore" property or DOCUMENT_STORE method',
        },
        status: "SKIPPED",
        type: "DOCUMENT_STATUS",
      },
      {
        data: {
          details: {
            issuance: [
              {
                did: "did:ethr:0x1245e5b64d785b25057f7438f715f4aa5d965733",
                issued: true,
              },
            ],
            revocation: [
              {
                address:
                  "http://localhost:9999/.netlify/functions/ocsp-responder",
                revoked: false,
              },
            ],
          },
          issuedOnAll: true,
          revokedOnAny: false,
        },
        name: "OpenAttestationDidSignedDocumentStatus",
        status: "VALID",
        type: "DOCUMENT_STATUS",
      },
      {
        name: "OpenAttestationDnsTxtIdentityProof",
        reason: {
          code: 2,
          codeString: "SKIPPED",
          message:
            'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
        },
        status: "SKIPPED",
        type: "ISSUER_IDENTITY",
      },
      {
        data: [
          {
            key: "did:ethr:0x1245e5b64d785b25057f7438f715f4aa5d965733#controller",
            location: "demo-tradetrust.openattestation.com",
            status: "VALID",
          },
        ],
        name: "OpenAttestationDnsDidIdentityProof",
        status: "VALID",
        type: "ISSUER_IDENTITY",
      },
      {
        name: "OpenAttestationDidIdentityProof",
        reason: {
          code: 0,
          codeString: "SKIPPED",
          message:
            "Document is not using DID as top level identifier or has not been wrapped",
        },
        status: "SKIPPED",
        type: "ISSUER_IDENTITY",
      },
    ]);
  });
});
