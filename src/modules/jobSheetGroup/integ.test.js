import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../schema'
import config from '../../config/config'
import db from '../../mongo/connect'

// to test this file use: yarn test:w src/modules/jobSheetGroup/integ.test.js

const { typeDefs, resolvers } = schema
let query

const groupID = '5b195db0c2e75ffe21fdd0ed'

const JOBSHEET_GROUP = gql`
query jobSheetGroup($groupID: ID!) {
  jobSheetGroup(groupID: $groupID) {
    _id
    jobsheetID
    costs {
      __typename
      discounted
      extendTotal
      extendUnit
      install
      installType
      netUnit
      options
      trim
      windows
    }
    dims {
      __typename
      height {
        __typename
        decimal
        diff
        fraction
        inch
      }
      width {
        __typename
        decimal
        diff
        fraction
        inch
      }
    }
    items {
      __typename
      _id
      costs {
        __typename
        extendUnit
        extendTotal
      }
      dims {
        __typename
        height {
          __typename
          decimal
          fraction
          inch
          overSize
          round
          underSize
        }
        width {
          __typename
          decimal
          fraction
          inch
          overSize
          round
          underSize
        }
      }
      product {
        name
      }
      productID
      qty
      specs {
        extendSqft
        overSize
        sqft
      }
    }
    qty
    rooms
    specs {
      groupTypeDescription
      installType
      options
      sqft
      style
      trim
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

test('jobSheetGroup', async () => {
  const res = await query({ query: JOBSHEET_GROUP, variables: { groupID } })
  const { jobSheetGroup } = res.data
  expect(jobSheetGroup).toBeTruthy()
  expect(res).toMatchSnapshot()
})
