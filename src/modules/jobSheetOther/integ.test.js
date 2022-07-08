import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../schema'
import config from '../../config/config'
import db from '../../mongo/connect'

// to test this file use: yarn test:w src/modules/jobSheetOther/integ.test.js

const { typeDefs, resolvers } = schema
let query

const otherID = '5b19e00f2aac04230d7ec012'

const JOBSHEET_OTHER = gql`
query jobSheetOther($otherID: ID!) {
  jobSheetOther(otherID: $otherID) {
    __typename
    _id
    jobsheetID
    costs {
      __typename
      extendTotal
      extendUnit
    }
    description
    product
    qty
    rooms
    specs {
      __typename
      options
      location
    }
    createdAt
    updatedAt
  }
}`

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })
  const testClient = createTestClient(server)
  query = testClient.query // eslint-disable-line prefer-destructuring
})

test('jobSheetOther', async () => {
  const res = await query({ query: JOBSHEET_OTHER, variables: { otherID } })
  const { jobSheetOther } = res.data
  expect(jobSheetOther).toBeTruthy()
  // expect(res).toMatchSnapshot()
})
