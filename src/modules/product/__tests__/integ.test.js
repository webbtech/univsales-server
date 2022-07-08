import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../../schema'
import config from '../../../config/config'
import db from '../../../mongo/connect'

// to test this file use: yarn test:w src/modules/product/

const { typeDefs, resolvers } = schema
let query

const PRODUCTS = gql`
query Products {
  products {
    __typename
    _id
    maxHeight
    maxWidth
    minHeight
    minWidth
    name
    premium {
      cost
      oversizeLimit
    }
    sizeCost
  }
}
`

let dbConn
beforeAll(async () => {
  const cfg = await config.load()
  dbConn = await db.connect(cfg)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })
  const testClient = createTestClient(server)
  query = testClient.query // eslint-disable-line prefer-destructuring
})

afterAll(async () => {
  dbConn.close()
})

test('products', async () => {
  const res = await query({ query: PRODUCTS })
  const { products } = res.data
  expect(products.length).toBeGreaterThan(7)
  // expect(res).toMatchSnapshot()
})
