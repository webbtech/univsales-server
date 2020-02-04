import { gql } from 'apollo-server'

export default gql`
# extend type Mutation {
# }
extend type Query {
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
`
