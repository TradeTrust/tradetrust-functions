# TradeTrust functions

API endpoints to use.

## Document storage

POST

- `/storage` uploads an encrypted OpenAttestation document
- `/storage/:id` uploads an encrypted OpenAttestation document with decrypt key from `/storage/queue`

GET

- `/storage/:id` returns an encrypted OpenAttestation document
- `/storage/queue` returns id and generated decrypt key

## Verify

POST

- `/verify` verifies an OpenAttestation document on mainnet network
- `/verify?network="goerli"` verifies an OpenAttestation document on goerli network

### Development

`npm run start`

#### Notes

The dummy value in `API_KEY` should work for local development purposes. For production `API_KEY` value, refer to netlify env variables at dashboard.
