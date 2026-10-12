import { isAllowedBrowserOrigin } from "../../netlify/constants";
import { isTrustedOrigin } from "../../netlify/utils";

describe("isAllowedBrowserOrigin", () => {
  it.each([
    "https://tradetrust.io",
    "https://www.tradetrust.io",
    "https://creator.tradetrust.io",
    "https://dev.tradetrust.io",
    "https://ref.tradetrust.io",
    "https://tradetrust-website.netlify.app",
    "https://deploy-preview-42--tradetrust-website.netlify.app",
    "https://feature-branch--tradetrust-website.netlify.app",
  ])("allows %s", (origin) => {
    expect(isAllowedBrowserOrigin(origin)).toBe(true);
  });

  it.each([
    "http://tradetrust.io",
    "https://tradetrust.io.evil.com",
    "https://eviltradetrust.io",
    "https://nottradetrust.io",
    "https://foo.tradetrust.io.evil.com",
    "https://tradetrust.io.github.io",
    "https://eviltradetrust-website.netlify.app",
    "https://nottradetrust-website.netlify.app",
    "https://tradetrust-website.netlify.app.evil.com",
    "https://foo.tradetrust-website.netlify.app",
    "https://v5-dev-tradetrust-website.netlify.app",
    "https://v5-beta--v5-dev-tradetrust-website.netlify.app",
    "https://evil.com--tradetrust-website.netlify.app",
    "https://user:pass@tradetrust.io",
    "https://tradetrust.io/foo",
    "https://tradetrust.io:8443",
    "https://evil.com",
    "null",
  ])("rejects %s", (origin) => {
    expect(isAllowedBrowserOrigin(origin)).toBe(false);
  });
});

describe("isTrustedOrigin", () => {
  it("accepts a page on a trusted host", () => {
    expect(isTrustedOrigin("https://dev.tradetrust.io/verify")).toBe(true);
  });

  it("rejects a free-host name that only contains the trusted site name", () => {
    expect(
      isTrustedOrigin("https://eviltradetrust-website.netlify.app/verify")
    ).toBe(false);
  });

  it("rejects a trusted name followed by an attacker domain", () => {
    expect(isTrustedOrigin("https://tradetrust.io.evil.com/verify")).toBe(
      false
    );
  });
});
