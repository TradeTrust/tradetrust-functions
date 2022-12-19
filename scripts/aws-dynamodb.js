// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const shell = require("shelljs");

const TABLE_NAME = "tradetrust-dev-ocsp-responder";
const ENDPOINT_URL = "http://localhost:8000";

shell.exec(
  `aws dynamodb create-table \
 --table-name ${TABLE_NAME} \
 --attribute-definitions \
 AttributeName=documentHash,AttributeType=S \
 --key-schema \
 AttributeName=documentHash,KeyType=HASH \
 --provisioned-throughput \
 ReadCapacityUnits=1,WriteCapacityUnits=1 \
 --endpoint-url ${ENDPOINT_URL}`,
);
