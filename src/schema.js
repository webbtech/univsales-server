import { gql } from 'apollo-server' // eslint-disable-line import/no-extraneous-dependencies
import { merge } from 'lodash'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'

import { addressResolvers, addressSchema } from './modules/address'
import { customerResolvers, customerSchema } from './modules/customer'
import { quoteResolvers, quoteSchema } from './modules/quote'
import { jobSheetResolvers, jobSheetSchema } from './modules/jobSheet'
import { jobSheetGroupResolvers } from './modules/jobSheetGroup'
import { jobSheetOtherResolvers } from './modules/jobSheetOther'
import { jobSheetWindowResolvers } from './modules/jobSheetWindow'
import { paymentResolvers, paymentSchema } from './modules/payment'
import { productResolvers, productSchema } from './modules/product'

const Query = gql`
  scalar JSON
  scalar JSONObject # TODO: check if this is of any value
  type Query {
    hello: String
  }
`

const Mutation = gql`
  type Mutation {
    _empty: String
  }
  type DBResult {
    n: Int
    ok: Int
  }
`

const helloResolvers = {
  Query: {
    hello: () => 'Hello world!', // Used primarily as a heartbeat
  },
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
}

const schema = {
  typeDefs: [
    Query,
    Mutation,
    addressSchema,
    customerSchema,
    quoteSchema,
    paymentSchema,
    productSchema,
    jobSheetSchema,
  ],
  resolvers: merge(
    helloResolvers,
    addressResolvers,
    customerResolvers,
    jobSheetResolvers,
    jobSheetGroupResolvers,
    jobSheetOtherResolvers,
    jobSheetWindowResolvers,
    paymentResolvers,
    productResolvers,
    quoteResolvers,
  ),
}

export default schema
