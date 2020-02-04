import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../../schema'
import config from '../../../config/config'
import db from '../../../mongo/connect'

import { quoteID, paymentInput } from '../mockData'
import {
  newQuoteInput,
  quoteInput,
} from '../../quote/mockData'
// to test this file use: yarn test:w src/modules/payment

const { typeDefs, resolvers } = schema
let query
let mutate
let newPaymentID
let newQuoteID
let quotePersistRet

const PAYMENTS = gql`
query Payments($quoteID: ID!) {
  payments(quoteID: $quoteID) {
    _id
    amount
    quoteID
    type
    createdAt
    updatedAt
  }
}
`

const PERSIST_PAYMENT = gql`
mutation paymentPersist($input: PaymentInput!) {
  paymentPersist(input: $input) {
    _id
    amount
  }
}`

const REMOVE_PAYMENT = gql`
mutation paymentRemove($id: ID!) {
  paymentRemove(id: $id) {
    n
    ok
  }
}`

const PERSIST_QUOTE = gql`
mutation quotePersist($input: QuoteInput!) {
  quotePersist(input: $input) {
    _id
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
  }
}`

const QUOTE = gql`
query Data($quoteID: ID!) {
  quote(quoteID: $quoteID) {
    __typename
    _id
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
  }
}`

const REMOVE_QUOTE = gql`
mutation quoteRemove($id: ID!) {
  quoteRemove(id: $id) {
    n
    ok
  }
}`

let dbConn
beforeAll(async () => {
  const cfg = await config.load()
  dbConn = await db.connect(cfg)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ cfg }),
  })
  const testClient = createTestClient(server)
  query = testClient.query // eslint-disable-line prefer-destructuring
  mutate = testClient.mutate // eslint-disable-line prefer-destructuring
})

afterAll(async () => {
  dbConn.close()
})

test('payments', async () => {
  const res = await query({ query: PAYMENTS, variables: { quoteID } })
  const { payments } = res.data
  expect(payments).toBeTruthy()
  expect(res).toMatchSnapshot()
})

describe('persist mutations', () => {
  beforeAll(async () => {
    const res = await mutate({
      mutation: PERSIST_QUOTE,
      variables: { input: newQuoteInput },
    })
    const { quotePersist } = res.data
    newQuoteID = quotePersist._id
    expect(quotePersist).toBeTruthy()

    quoteInput._id = newQuoteID
    quoteInput.version = 1
    const res2 = await mutate({
      mutation: PERSIST_QUOTE,
      variables: { input: quoteInput },
    })
    const { quotePersist: quotePersist2 } = res2.data
    expect(quotePersist2).toBeTruthy()
  })

  afterAll(async () => {
    if (newPaymentID) {
      const res = await mutate({
        mutation: REMOVE_PAYMENT,
        variables: { id: newPaymentID },
      })
      const { paymentRemove } = res.data
      expect(paymentRemove.n).toEqual(1)
      expect(paymentRemove.ok).toEqual(1)
    }

    if (newQuoteID) {
      const res2 = await mutate({
        mutation: REMOVE_QUOTE,
        variables: { id: newQuoteID },
      })
      const { quoteRemove: quoteRemove2 } = res2.data
      expect(quoteRemove2.n).toEqual(1)
      expect(quoteRemove2.ok).toEqual(1)
    }
  })

  test('paymentPersist', async () => {
    paymentInput.quoteID = newQuoteID
    const res = await mutate({
      mutation: PERSIST_PAYMENT,
      variables: { input: paymentInput },
    })
    const { paymentPersist } = res.data
    newPaymentID = paymentPersist._id
    expect(paymentPersist).toBeTruthy()

    // now fetch quote to test values
    const res2 = await query({
      query: QUOTE,
      variables: { quoteID: newQuoteID },
    })
    const { quote: { quotePrice } } = res2.data
    expect(quotePrice.payments).toEqual(paymentPersist.amount)
    expect(quotePrice.outstanding).toEqual(quotePrice.total - paymentPersist.amount)
  })
})
