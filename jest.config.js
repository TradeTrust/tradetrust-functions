/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  moduleNameMapper: {
    "^cborg$": "<rootDir>/node_modules/cborg/cborg.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@digitalbazaar|base64url-universal|base58-universal|cborg)/)",
  ],
};
