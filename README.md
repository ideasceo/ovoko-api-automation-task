# Petstore API Tests

Tests for [Swagger Petstore](https://petstore.swagger.io/v2).

## Setup

```bash
npm install
```

```bash
npm test
```

## What's tested

- Create 4 pets and verify their status
- Place 2 orders per pet (8 total)
- Clean up — delete all orders and pets
- Verify deleted resources return 404
- Known API bugs documented as failing tests
