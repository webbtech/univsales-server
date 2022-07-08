import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'
import moment from 'moment'

import schema from '../../../schema'
import config from '../../../config/config'
import db from '../../../mongo/connect'

import {
  customerID,
  discountInput,
  newQuoteInput,
  quoteID,
  quoteInput,
} from '../mockData'

// to test this module, run: yarn test:w src/modules/quote

const { typeDefs, resolvers } = schema
let query
let mutate
let newQuoteID

const signedURLInput = {
  number: 1083,
  type: 'quote',
  version: 1,
}
const nearbyJobsInput = {
  maxDistance: 5000,
  coordinates: [
    -79.2730617,
    43.014424,
  ],
}

const PDF_SIGNED_URL = gql`
query pdfSignedURL($input: SignedURLInput!) {
  pdfSignedURL(input: $input) {
    code
    data {
      url
    }
    message
    status
    timestamp
  }
}`

const QUOTE = gql`
query Data($quoteID: ID!) {
  quote(quoteID: $quoteID) {
    __typename
    _id
    number
    version
    invoiced
    closed
    customerID {
      _id
      name {
        first
        last
      }
    }
    jobsheetID {
      _id
      addressID {
        _id
        street1
        city
      }
    }
    discount {
      description
      discount
      subtotal
      tax
      total
    }
    items {
      group
      other
      window
    }
    itemCosts {
      group
      other
      subtotal
      window
    }
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
  }
}`

const QUOTES_BY_CUSTOMER = gql`
query QuotesByCustomer($customerID: ID!) {
  searchQuotesByCustomer(customerID: $customerID) {
    totalInvoiced
    totalOutstanding
    quotes {
      _id
      closed
      invoiced
      number
      version
      customerID {
        _id
      }
      quotePrice {
        outstanding
        total
      }
      jobsheetID {
        _id
        addressID {
          _id
          street1
          city
        }
        number
      }
      updatedAt
    }
  }
} `

const NEARBY_QUOTES = gql`
query QuoteNearbyJobs($input: AddressGeoInput!) {
  quoteNearbyJobs(input: $input) {
    _id
    city
    customerID
    location {
      coordinates
    }
    postalCode
    provinceCode
    street1
    dist {
      calculated
    }
  }
}`

const SEARCH_QUOTES = gql`
query($year: String, $invoiced: Boolean, $closed: Boolean) {
  searchQuotes(year: $year, invoiced: $invoiced, closed: $closed) {
    totalInvoiced
    totalOutstanding
    quotes {
      __typename
      _id
      number
      version
      closed
      invoiced
      customerID {
        _id
        name {
          first
          last
        }
      }
      jobsheetID {
        _id
        addressID {
          _id
          street1
          city
        }
        features
      }
      quotePrice {
        outstanding
        payments
        subtotal
        tax
        total
      }
      createdAt
      updatedAt
    }
  }
}
`

const SEARCH_CUSTOMER_RECENT = gql`
query SearchCustomerRecent {
  searchCustomerRecent {
    __typename
    _id
    invoiced
    version
    number
    customer {
      name {
        first
        last
      }
    }
    quotePrice {
      __typename
      outstanding
      total
    }
    updatedAt
    address {
      __typename
      _id
      city
      street1
    }
  }
}`

const PERSIST_QUOTE = gql`
mutation quotePersist($input: QuoteInput!) {
  quotePersist(input: $input) {
    _id
    closed
    createdAt
    invoiced
    number
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
    itemCosts {
      group
      other
      subtotal
      window
    }
    updatedAt
    version
  }
}`

const PERSIST_QUOTE_DISCOUNT = gql`
mutation quotePersistDiscount($input: QuoteDiscountInput!) {
  quotePersistDiscount(input: $input) {
    _id
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
    itemCosts {
      group
      other
      subtotal
      window
    }
    discount {
      description
      discount
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

const CREATE_INVOICE = gql`
mutation createInvoice($id: ID!) {
  createInvoice(id: $id) {
    _id
    invoiced
    quotePrice {
      outstanding
      payments
      subtotal
      tax
      total
    }
    itemCosts {
      group
      other
      subtotal
      window
    }
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
}, 10)

test('get quote', async () => {
  const res = await query({
    query: QUOTE,
    variables: { quoteID },
  })
  const { quote } = res.data
  expect(quote).toBeTruthy()
  expect(quote.customerID).toBeTruthy()
  expect(quote.jobsheetID).toBeTruthy()
  expect(quote.jobsheetID.addressID).toBeTruthy()
  // expect(res).toMatchSnapshot()
})

test('get quotes by year', async () => {
  const res = await query({
    query: SEARCH_QUOTES,
    variables: { year: '2019' },
  })
  const { searchQuotes } = res.data
  expect(searchQuotes).toBeTruthy()
  const { quotes } = searchQuotes

  let allYears = true
  quotes.forEach((r) => {
    const createdAt = moment(Number(r.createdAt))
    const year = createdAt.year()
    if (year !== 2019) {
      allYears = false
    }
  })
  expect(allYears).toBeTruthy()
})

test('get recent quotes invoiced ', async () => {
  const res = await query({
    query: SEARCH_QUOTES,
    variables: { invoiced: true },
  })
  const { searchQuotes } = res.data
  const { quotes } = searchQuotes
  expect(searchQuotes).toBeTruthy()
  expect(quotes.length).toEqual(100)
  expect(searchQuotes.totalInvoiced).toBeGreaterThan(10000)
  expect(searchQuotes.totalOutstanding).toBeGreaterThan(10000)

  let allInvoiced = true
  quotes.forEach((r) => {
    if (r.invoiced !== true) {
      allInvoiced = false
    }
  })
  expect(allInvoiced).toBeTruthy()
})

test('get recent quotes invoiced & closed ', async () => {
  const res = await query({
    query: SEARCH_QUOTES,
    variables: { invoiced: true, closed: true },
  })
  const { searchQuotes } = res.data
  const { quotes } = searchQuotes
  expect(searchQuotes).toBeTruthy()
  expect(quotes.length).toEqual(100)
  expect(searchQuotes.totalInvoiced).toBeGreaterThan(10000)
  expect(searchQuotes.totalOutstanding).toBeLessThanOrEqual(0)

  let allInvoiced = true
  let allClosed = true
  quotes.forEach((r) => {
    if (r.invoiced !== true) {
      allInvoiced = false
    }
    if (r.closed !== true) {
      allClosed = false
    }
  })
  expect(allInvoiced).toBeTruthy()
  expect(allClosed).toBeTruthy()
})

test('searchQuotesByCustomer', async () => {
  const res = await query({
    query: QUOTES_BY_CUSTOMER,
    variables: { customerID },
  })
  const { quotes, totalInvoiced } = res.data.searchQuotesByCustomer
  expect(totalInvoiced).toBeGreaterThan(10000)
  expect(quotes.length).toBeGreaterThan(3)
})

test('pdfSignedURL', async () => {
  const res = await query({
    query: PDF_SIGNED_URL,
    variables: { input: signedURLInput },
  })
  const { data } = res.data.pdfSignedURL
  const stStr = 'https://ca-universalwindows.s3.ca-central-1.amazonaws.com/quote/qte-1083-r1.pdf'
  expect(data.url.indexOf(stStr)).toEqual(0)
})

test('searchCustomerRecent', async () => {
  const res = await query({
    query: SEARCH_CUSTOMER_RECENT,
  })
  const { searchCustomerRecent: quotes } = res.data
  expect(quotes.length).toEqual(100)
})

test('quoteNearbyJobs', async () => {
  const res = await query({
    query: NEARBY_QUOTES,
    variables: { input: nearbyJobsInput },
  })
  const { quoteNearbyJobs: quotes } = res.data
  expect(quotes.length).toBeGreaterThan(2)
  expect(quotes[0]).toBeTruthy()
  expect(Object.keys(quotes[0]).length).toEqual(8)
})

describe('persist mutations', () => {
  afterAll(async () => {
    if (newQuoteID) {
      // necessary to delete twice as we have to first delete invoice status, then actual quote
      const res = await mutate({
        mutation: REMOVE_QUOTE,
        variables: { id: newQuoteID },
      })
      const { quoteRemove } = res.data
      expect(quoteRemove.n).toEqual(1)
      expect(quoteRemove.ok).toEqual(1)

      const res2 = await mutate({
        mutation: REMOVE_QUOTE,
        variables: { id: newQuoteID },
      })
      const { quoteRemove: quoteRemove2 } = res2.data
      expect(quoteRemove2.n).toEqual(1)
      expect(quoteRemove2.ok).toEqual(1)
    }
  })

  test('persistQuote new', async () => {
    const res = await mutate({
      mutation: PERSIST_QUOTE,
      variables: { input: newQuoteInput },
    })
    const { quotePersist } = res.data
    newQuoteID = quotePersist._id
    expect(quotePersist).toBeTruthy()
  })

  test('persistQuote update', async () => {
    quoteInput._id = newQuoteID
    quoteInput.version = 1
    const res = await mutate({
      mutation: PERSIST_QUOTE,
      variables: { input: quoteInput },
    })
    const { quotePersist } = res.data
    const id = quotePersist._id
    expect(quotePersist).toBeTruthy()
    expect(id).toEqual(newQuoteID)
    expect(quotePersist.quotePrice.total).toEqual(quoteInput.quotePrice.total)
  })

  test('createInvoice', async () => {
    const res = await mutate({
      mutation: CREATE_INVOICE,
      variables: { id: newQuoteID },
    })
    const { createInvoice } = res.data
    expect(createInvoice).toBeTruthy()
    expect(createInvoice.quotePrice.outstanding).toEqual(quoteInput.quotePrice.total)
    expect(createInvoice.invoiced).toEqual(true)
  })

  test('quotePersistDiscount', async () => {
    discountInput._id = newQuoteID
    const res = await mutate({
      mutation: PERSIST_QUOTE_DISCOUNT,
      variables: { input: discountInput },
    })
    const { quotePersistDiscount: discount } = res.data
    expect(discount).toBeTruthy()
    const discountCalc = discount.itemCosts.subtotal - discountInput.discount.discount
    expect(discount.discount.total).toEqual(discountCalc)
  })
})
