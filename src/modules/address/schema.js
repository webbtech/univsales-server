import { gql } from 'apollo-server-lambda'

export default gql`

type Address {
  _id: ID!
  associate: String!
  city: String
  country: String
  countryCode: String
  customerID: ID
  location: Location
  postalCode: String
  provinceCode: String
  street1: String
  street2: String
  type: String
}

type AddressGeo {
  _id: ID!
  city: String
  customerID: ID
  dist: GeoDistance
  location: Location
  postalCode: String
  provinceCode: String
  street1: String
}

type GeoDistance {
  calculated: Float
  location: Location
}

input AddressGeoInput {
  coordinates: [Float]
  maxDistance: Int
}

type Location {
  coordinates: [Float]
  type: String
}

input AddressInput {
  _id: ID
  associate: String!
  city: String!
  country: String
  countryCode: String
  customerID: ID
  location: LocationInput
  postalCode: String!
  provinceCode: String!
  street1: String!
  street2: String
  type: String!
}

input LocationInput {
  coordinates: [Float]
  type: String
}
`
