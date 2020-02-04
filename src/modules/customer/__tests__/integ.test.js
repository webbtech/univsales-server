import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../../schema'
import config from '../../../config/config'
import db from '../../../mongo/connect'

import {
  addressNew,
  addressUpdate,
  customerID,
  customerNew,
  customerUpdate,
  persistNotesVars,
} from '../mockData'

// to test this file use: yarn test:w src/modules/customer

const { typeDefs, resolvers } = schema
let query
let mutate
let newCustomerID

const CUSTOMER = gql`
query Customer($customerID: ID!) {
  customer(customerID: $customerID) {
    __typename
    _id
    active
    address {
      __typename
      _id
      associate
      city
      country
      countryCode
      postalCode
      provinceCode
      street1
      street2
      type
    }
    email
    name {
      __typename
      first
      last
      spouse
    }
    phones {
      __typename
      _id
      countryCode
      number
    }
    createdAt
    updatedAt
  }
}
`

const SEARCH_CUSTOMER = gql`
query($field: String, $value: String, $search: String, $active: Boolean) {
  searchCustomer(field: $field, value: $value, search: $search, active: $active) {
    __typename
    _id
    active
    address {
      _id
      associate
      city
      country
      countryCode
      postalCode
      provinceCode
      street1
      street2
      type
    }
    createdAt
    email
    name {
      first
      last
      spouse
    }
    phones {
      _id
      countryCode
      number
    }
    updatedAt
  }
}
`

const CUSTOMER_DATA = gql`
query GetCustomerWithData($customerID: ID!) {
  customer(customerID: $customerID) {
    __typename
    _id
    active
    address {
      _id
      associate
      city
      country
      countryCode
      postalCode
      provinceCode
      street1
      street2
      type
    }
    email
    name {
      first
      last
      spouse
    }
    phones {
      _id
      countryCode
      number
    }
    createdAt
    updatedAt
  }
  searchQuotesByCustomer(customerID: $customerID) {
    quotes {
      _id
      closed
      invoiced
      number
      version
      quotePrice {
        outstanding
        total
      }
      jobsheetID {
        addressID {
          street1
          city
        }
      }
      updatedAt
    }
    totalInvoiced
    totalOutstanding
  }
  searchJobSheetsByCustomer(customerID: $customerID) {
    _id
    addressID {
      _id
      street1
      city
    }
    updatedAt
  }
}
`

const PERSIST_CUSTOMER = gql`
mutation customerPersist($customerInput: CustomerInput!, $addressInput: AddressInput) {
  customerPersist(customerInput: $customerInput, addressInput: $addressInput) {
    _id
    active
    createdAt
    email
    name {
      first
      last
      spouse
    }
    notes
  }
}`

const REMOVE_CUSTOMER = gql`
mutation customerRemove($id: ID!) {
  customerRemove(id: $id) {
    n
    ok
  }
}`

const TOGGLE_ACTIVE_CUSTOMER = gql`
mutation customerToggleActive($id: ID!) {
  customerToggleActive(id: $id) {
    active
  }
}`

const PERSIST_NOTES = gql`
mutation customerPersistNotes($id: ID!, $notes: String!) {
  customerPersistNotes(id: $id, notes: $notes) {
    notes
  }
}`

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
  mutate = testClient.mutate // eslint-disable-line prefer-destructuring
})

afterAll(async () => {
  dbConn.close()
})

test('get customer by id', async () => {
  const res = await query({
    query: CUSTOMER,
    variables: { customerID },
  })
  const { customer } = res.data
  expect(customer).toBeTruthy()
  // expect(res).toMatchSnapshot()
})

test('search last name', async () => {
  const res = await query({
    query: SEARCH_CUSTOMER,
    variables: { field: 'name.last', value: 'dim' },
  })
  const { searchCustomer } = res.data
  expect(searchCustomer.length).toBeGreaterThan(3)
  // expect(res).toMatchSnapshot()
})

test('search phone', async () => {
  const res = await query({
    query: SEARCH_CUSTOMER,
    variables: { field: 'phones.number', value: '1231231234' },
  })
  const { searchCustomer } = res.data
  expect(searchCustomer.length).toEqual(1)
  // expect(res).toMatchSnapshot()
})

test('search by address', async () => {
  const res = await query({
    query: SEARCH_CUSTOMER,
    variables: { search: 'northgate' },
  })
  const { searchCustomer } = res.data
  expect(searchCustomer.length).toBeGreaterThan(1)
  // expect(res).toMatchSnapshot()
})

test('customer data', async () => {
  const res = await query({
    query: CUSTOMER_DATA,
    variables: { customerID },
  })

  const { customer, searchQuotesByCustomer, searchJobSheetsByCustomer } = res.data
  expect(customer).toBeTruthy()
  expect(searchQuotesByCustomer).toBeTruthy()
  expect(searchJobSheetsByCustomer).toBeTruthy()
  // expect(res).toMatchSnapshot()
})
describe('persist mutations', () => {
  afterAll(async () => {
    if (newCustomerID) {
      const res = await mutate({
        mutation: REMOVE_CUSTOMER,
        variables: { id: newCustomerID },
      })
      const { customerRemove } = res.data
      expect(customerRemove.n).toEqual(1)
      expect(customerRemove.ok).toEqual(1)
    }
  })

  test('customer persist new', async () => {
    const res = await mutate({
      mutation: PERSIST_CUSTOMER,
      variables: { customerInput: customerNew, addressInput: addressNew },
    })
    const { customerPersist } = res.data
    newCustomerID = customerPersist._id
    expect(customerPersist._id).toBeTruthy()
  })

  test('customer persist existing', async () => {
    customerUpdate._id = newCustomerID
    const res = await mutate({
      mutation: PERSIST_CUSTOMER,
      variables: { customerInput: customerUpdate, addressInput: addressUpdate },
    })
    const { customerPersist } = res.data
    expect(customerPersist._id).toBeTruthy()
    expect(customerPersist.name).toEqual({ first: "Test", last: "Dummy", spouse: "Kimberly" }) // eslint-disable-line quotes
  })

  test('customerPersistNotes', async () => {
    const res = await mutate({
      mutation: PERSIST_NOTES,
      variables: persistNotesVars,
    })

    const { customerPersistNotes: notesRet } = res.data
    expect(res).toBeTruthy()
    expect(notesRet.notes).toEqual(persistNotesVars.notes)
  })

  test('customerToggleActive', async () => {
    const res = await query({
      query: CUSTOMER,
      variables: { customerID },
    })
    const { customer } = res.data
    const { active: origActive } = customer

    const resM = await mutate({
      mutation: TOGGLE_ACTIVE_CUSTOMER,
      variables: { id: customerID },
    })
    const { active } = resM.data.customerToggleActive
    expect(active).toEqual(!origActive)
  })
})
