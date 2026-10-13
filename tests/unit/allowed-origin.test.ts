import { ALLOWED_ORIGIN_REGEX } from "../../netlify/constants";

describe("ALLOWED_ORIGIN_REGEX", () => {
  it("allows the apex, real subdomains, and the website Netlify host", () => {
    expect(ALLOWED_ORIGIN_REGEX.test("https://tradetrust.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://www.tradetrust.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://dev.tradetrust.io")).toBe(true);
    expect(ALLOWED_ORIGIN_REGEX.test("https://creator.tradetrust.io")).toBe(
      true
    );
    expect(ALLOWED_ORIGIN_REGEX.test("https://ref.tradetrust.io")).toBe(true);
    expect(
      ALLOWED_ORIGIN_REGEX.test("https://tradetrust-website.netlify.app")
    ).toBe(true);
    expect(
      ALLOWED_ORIGIN_REGEX.test(
        "https://deploy-preview-12--tradetrust-website.netlify.app"
      )
    ).toBe(true);
  });

  it("rejects a trusted name glued to another host or an unrelated Netlify site", () => {
    expect(ALLOWED_ORIGIN_REGEX.test("https://tradetrust.io.evil.com")).toBe(
      false
    );
    expect(ALLOWED_ORIGIN_REGEX.test("https://eviltradetrust.io")).toBe(false);
    expect(
      ALLOWED_ORIGIN_REGEX.test(
        "https://tradetrust-website.netlify.app.evil.com"
      )
    ).toBe(false);
    expect(
      ALLOWED_ORIGIN_REGEX.test("https://eviltradetrust-website.netlify.app")
    ).toBe(false);
  });
});
