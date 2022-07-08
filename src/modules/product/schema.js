import { gql } from 'apollo-server'

export default gql`
extend type Mutation {
  productPersist(input: ProductInput!): Product
}

extend type Query {
  product(productID: ID!): Product
  products: [Product]
}

type Product {
  _id: ID!
  maxHeight: Int
  maxWidth: Int
  minHeight: Int
  minWidth: Int
  name: String!
  premium: ProductPremium
  sizeCost: JSON
}

type ProductPremium {
  cost: Int
  oversizeLimit: Int
}

input ProductInput {
_id: ID!
  maxHeight: Int!
  maxWidth: Int!
  minHeight: Int!
  minWidth: Int!
  name: String!
  premium: ProductPremiumInput!
  sizeCost: JSON!
}

input ProductPremiumInput {
  cost: Int!
  oversizeLimit: Int!
}
`
