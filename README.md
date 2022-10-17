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

`npm run start`

#### Notes

The dummy value in `API_KEY` should work for local development purposes. For production `API_KEY` value, refer to netlify env variables at dashboard.
