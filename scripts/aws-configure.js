/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const shell = require("shelljs");

if (process.env.GITHUB_ACTIONS) {
  // only configure fake credentials in github actions!
  shell.exec(`aws configure set aws_access_key_id fakeMyKeyId`);
  shell.exec(`aws configure set aws_secret_access_key fakeSecretAccessKey`);
  shell.exec(`aws configure set default.region ap-southeast-1`);
}
