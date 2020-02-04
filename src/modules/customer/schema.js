import { gql } from 'apollo-server'

export default gql`
extend type Mutation {
  customerPersist(addressInput: AddressInput, customerInput: CustomerInput!): Customer
  customerPersistNotes(id: ID!, notes: String!): Customer
  customerRemove(id: ID!): DBResult
  customerToggleActive(id: ID!): Customer
}
extend type Query {
  customer(customerID: ID!): Customer
  searchCustomer(active: Boolean, field: String, search: String, value: String): [Customer]
  # searchCustomerRecent: [QuoteRecent]
}
type Customer {
  _id: ID!
  active: Boolean!
  address: Address
  createdAt: String
  email: String
  name: CustomerName!
  notes: String
  phones: [CustomerPhone]
  updatedAt: String
}

type CustomerName {
  first: String!
  last: String!
  spouse: String
}

type CustomerPhone {
  _id: PhoneType!
  countryCode: String
  number: String!
}

input CustomerInput {
  _id: ID
  email: String
  name: CustomerNameInput!
  phones: [CustomerPhoneInput]
}

input CustomerNameInput {
  first: String!
  last: String!
  spouse: String
}

input CustomerPhoneInput {
  _id: PhoneType!
  countryCode: String
  number: String!
}

enum PhoneType {
  home
  mobile
}
`
