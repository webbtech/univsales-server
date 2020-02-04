import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../schema'
import config from '../../config/config'
import db from '../../mongo/connect'

// to test this file use: yarn test:w src/modules/jobSheetWindow/integ.test.js

const { typeDefs, resolvers } = schema
let query

const windowID = '5b1847242aac0405487ebfea'

const JOBSHEET_WINDOW = gql`
query JobSheetWindow($windowID: ID!) {
  jobSheetWindow(windowID: $windowID) {
    _id
    jobsheetID
    costs {
      discounted
      extendTotal
      extendUnit
      install
      installType
      netUnit
      options
      trim
      window
    }
    dims {
      height {
        decimal
        fraction
        inch
        overSize
        round
        underSize
      }
      width {
        decimal
        fraction
        inch
        overSize
        round
        underSize
      }
    }
    productID {
      _id
      name
    }
    qty
    rooms
    specs {
      installType
      options
      overSize
      sqft
      trim
    }
    createdAt
    updatedAt
  }
}
`
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

test('jobSheetWindow', async () => {
  const res = await query({ query: JOBSHEET_WINDOW, variables: { windowID } })
  const { jobSheetWindow } = res.data
  expect(jobSheetWindow).toBeTruthy()
  expect(res).toMatchSnapshot()
})
