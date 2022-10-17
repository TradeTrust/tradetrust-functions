# TradeTrust functions

API endpoints to use.

## Document storage

POST

- `/storage` uploads an encrypted OpenAttestation document
- `/storage/:id` uploads an encrypted OpenAttestation document with decrypt key from `/storage/queue`

GET

- `/storage/:id` returns an encrypted OpenAttestation document
- `/storage/queue` returns id and generated decrypt key

### Development

Copy `.env.example`, save and rename as `.env` file. This dummy `API_KEY` should work for local development purposes. For production `API_KEY`, refer to netlify env variables at dashboard.

`npm run start`
