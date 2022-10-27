# TradeTrust functions

API endpoints to use.

## ⚠️ Reminder

The following API endpoints are references on how you would implement such microservices for your own business requirements. They are NOT to be relied on, for any of your production related needs. We reserve the right to change or shutdown the API anytime.

> There is a limit of `2mb` on maximum request body size. Revising your OpenAttestation document file size might help if you encounter 413 `Payload Too Large` errors.

---

### Document storage

Endpoint: https://tradetrust-functions.netlify.app/.netlify/functions/storage

POST

- `/storage` uploads an encrypted OpenAttestation document
- `/storage/:id` uploads an encrypted OpenAttestation document with decrypt key from `/storage/queue`

```
// POST data example
{
  "document": {
    "version": "https://schema.openattestation.com/2.0/schema.json",
    ...rest
  }
}
```

GET

- `/storage/:id` returns an encrypted OpenAttestation document
- `/storage/queue` returns id and generated decrypt key

> Document storage endpoint currently supports only `goerli` network.

> The uploaded encrypted OpenAttestation documents will not be stored long term. They will be auto deleted after 31 days.

### Verify

Endpoint: https://tradetrust-functions.netlify.app/.netlify/functions/verify

POST

- `/verify` verifies an OpenAttestation document on mainnet network
- `/verify?network="goerli"` verifies an OpenAttestation document on goerli network
- `/verify?network="maticmum"` verifies an OpenAttestation document on maticmum network
- `/verify?network="sepolia"` verifies an OpenAttestation document on sepolia network

```
// POST data example
{
  "document": {
    "version": "https://schema.openattestation.com/2.0/schema.json",
    ...rest
  }
}
```

---

#### Development

`npm run start`

#### Notes

The dummy value in `API_KEY` should work for local development purposes. For production `API_KEY` value, refer to netlify env variables at dashboard.
