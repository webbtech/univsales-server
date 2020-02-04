import { gql } from 'apollo-server'

export default gql`
extend type Mutation {
  paymentPersist(input: PaymentInput!): Payment
  paymentRemove(id: ID!): DBResult
}

extend type Query {
  payments(quoteID: ID!): [Payment]
}

type Payment {
  _id: ID!
  amount: Float
  createdAt: String
  quoteID: ID
  type: String
  updatedAt: String
}

input PaymentInput {
  _id: ID
  amount: Float!
  quoteID: ID!
  type: String!
}
`
