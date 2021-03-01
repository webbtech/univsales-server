# README Doc

## Mongo

Ensure we have an 2dsphere index on the addresses table

`db.addresses.createIndex( { location : "2dsphere" } )`

See [Docs](https://docs.mongodb.com/manual/tutorial/query-a-2dsphere-index/)
