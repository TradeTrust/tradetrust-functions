# Tradetrust functions

API endpoints to use.

## Document storage

POST

- `/storage` uploads an encrypted oa document
- `/storage/:id` uploads an encrypted oa document with decrypt key previously from `/storage/queue`

GET

- `/storage/:id` returns an encrypted oa document
- `/storage/queue` returns id and generated decrypt key

### Development

`npm run start`
