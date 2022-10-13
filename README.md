# Tradetrust functions

API endpoints to use.

## Document storage

POST
`/storage` creates a new s3 object
`/storage/:id` creates a new s3 object with decrypt key from `/storage/queue`

GET
`/storage/:id` returns exact s3 object
`/storage/queue` returns s3 object id and generated decrypt key

### Development

`npm run start`
