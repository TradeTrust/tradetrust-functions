# TradeTrust functions

[![Netlify Status](https://api.netlify.com/api/v1/badges/d1d7e5ae-2010-4f42-bcf0-9e9b6b6f7b33/deploy-status)](https://app.netlify.com/sites/tradetrust-functions/deploys)

API endpoints to use.

## ⚠️ Reminder

The following API endpoints are references on how you would implement such microservices for your own business requirements. They are NOT to be relied on, for any of your production related needs. We reserve the right to change or shutdown the API anytime.

> There is a limit of `6mb` on maximum request body size. Revising your OpenAttestation document file size might help if you encounter 413 `Payload Too Large` errors.

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
    "network: {
      "chain": "9a09ae01-f16a-466d-ad66-b42e6b07e225:string:ETH",
      "chainId": "19ca73ed-e2cf-43ac-b104-3c43d2fc0680:string:5"
    },
    ...rest
  }
}
```

> Document storage endpoint requires `network.chainId` field in OA document.

> The uploaded encrypted OpenAttestation documents will not be stored long term. They will be auto deleted after 30 days.

GET

- `/storage/:id` returns an encrypted OpenAttestation document
- `/storage/queue` returns id and generated decrypt key

### Verify

Endpoint: https://tradetrust-functions.netlify.app/.netlify/functions/verify

POST

- `/verify` verifies an OpenAttestation document on mainnet network
- `/verify?network="amoy"` verifies an OpenAttestation document on amoy network
- `/verify?network="sepolia"` verifies an OpenAttestation document on sepolia network
- `/verify?network="xdcapothem"` verifies an OpenAttestation document on xdcapothem network
- `/verify?network="stability"` verifies an OpenAttestation document on stability network

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

#### Network specific configurations

The next environment variables are required for verifying documents on some of the networks. They are used through the `@tradetrust-tt/tradetrust-utils` package.

- INFURA_API_KEY: [Infura API key](https://www.infura.io/), used for verifying Polygon Amoy network
- STABILITY_API_KEY: [Stability API key](https://portal.stabilityprotocol.com), used for verifying documents on the Stability network
