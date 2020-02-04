import { createTestClient } from 'apollo-server-testing'
import { ApolloServer, gql } from 'apollo-server'

import schema from '../../../schema'
import config from '../../../config/config'
import db from '../../../mongo/connect'

import {
  address,
  jobsheet,
  features,
  groupInput,
  otherInput,
  windowInput,
} from '../mockData'

// test with: yarn test:w src/modules/jobSheet

const { typeDefs, resolvers } = schema
let query
let mutate
let newJobSheetID
let newGroupID
let newOtherID
let newWindowID

const customerID = '5b2122022aac043b0c7ec06d'
const jobSheetID = '5b1846d52aac0450227ebfe9'

const JOBSHEET_DATA = gql`
query GetJobSheetData($jobSheetID: ID!) {
  jobSheetData(jobSheetID: $jobSheetID) {
    jobsheet {
      __typename
      _id
      createdAt
      updatedAt
      features
      addressID {
        street2
        _id
        street1
        city
      }
      customerID {
        __typename
        _id
        name {
          first
          last
          spouse
        }
      }
    }
    windows {
      __typename
      _id
      costs {
        __typename
        extendTotal
        extendUnit
        install
        installType
        netUnit
        options
        trim
        window
      }
      qty
      rooms
      createdAt
      updatedAt
    }
    groups {
      __typename
      _id
      costs {
        __typename
        extendTotal
        extendUnit
        install
        installType
        netUnit
        options
        trim
        windows
      }
      qty
      rooms
      specs {
        __typename
        groupTypeDescription
      }
    }
    other {
      __typename
      _id
      costs {
        __typename
        extendTotal
        extendUnit
      }
      description
      qty
      rooms
      specs {
        __typename
        options
        location
      }
      updatedAt
      createdAt
    }
  }
}`
const CUSTOMER_JOBSHEETS = gql`
query JobSheetsByCustomer($customerID: ID!) {
  searchJobSheetsByCustomer(customerID: $customerID) {
    _id
    addressID {
      _id
      street1
      city
    }
    number
    updatedAt
  }
}`

const PERSIST_JOBSHEET = gql`
mutation jobSheetPersist(
  $jobSheetInput: JobSheetInput!,
  $addressInput: AddressInput,
) {
  jobSheetPersist(
    jobSheetInput: $jobSheetInput,
    addressInput: $addressInput,
  ) {
    _id
  }
}`

const REMOVE_JOBSHEET = gql`
mutation jobSheetRemove($id: ID!) {
  jobSheetRemove(id: $id) {
    n
    ok
  }
}`

const PERSIST_FEATURES = gql`
mutation jobSheetPersistFeatures($id: ID!, $features: String!) {
  jobSheetPersistFeatures(id: $id, features: $features) {
    _id
    features
  }
}`

const PERSIST_GROUP = gql`
mutation jobSheetPersistGroup($input: GroupInput!) {
  jobSheetPersistGroup(input: $input) {
    _id
  }
}`

const REMOVE_GROUP = gql`
mutation jobSheetRemoveGroup($id: ID!) {
  jobSheetRemoveGroup(id: $id) {
    n
    ok
  }
}`

const PERSIST_OTHER = gql`
mutation jobSheetPersistOther($input: OtherInput!) {
  jobSheetPersistOther(input: $input) {
    _id
  }
}`

const REMOVE_OTHER = gql`
mutation jobSheetRemoveOther($id: ID!) {
  jobSheetRemoveOther(id: $id) {
    n
    ok
  }
}`

const PERSIST_WINDOW = gql`
mutation jobSheetPersistWindow($input: WindowInput!) {
  jobSheetPersistWindow(input: $input) {
    _id
  }
}`

const REMOVE_WINDOW = gql`
mutation jobSheetRemoveWindow($id: ID!) {
  jobSheetRemoveWindow(id: $id) {
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
  })
  const testClient = createTestClient(server)
  query = testClient.query // eslint-disable-line prefer-destructuring
  mutate = testClient.mutate // eslint-disable-line prefer-destructuring
})

afterAll(async () => {
  dbConn.close()
})

test('jobSheetData', async () => {
  const res = await query({ query: JOBSHEET_DATA, variables: { jobSheetID } })
  const { jobSheetData } = res.data
  expect(jobSheetData).toBeTruthy()
  expect(res).toMatchSnapshot()
})

test('searchJobSheetsByCustomer', async () => {
  const res = await query({ query: CUSTOMER_JOBSHEETS, variables: { customerID } })
  const { searchJobSheetsByCustomer } = res.data
  expect(searchJobSheetsByCustomer).toBeTruthy()
  expect(res).toMatchSnapshot()
})

describe('persist mutations', () => {
  afterAll(async () => {
    if (newJobSheetID) {
      const res = await mutate({
        mutation: REMOVE_JOBSHEET,
        variables: { id: newJobSheetID },
      })
      const { jobSheetRemove } = res.data
      expect(jobSheetRemove.n).toEqual(1)
      expect(jobSheetRemove.ok).toEqual(1)
    }

    if (newGroupID) {
      const res = await mutate({
        mutation: REMOVE_GROUP,
        variables: { id: newGroupID },
      })
      const { jobSheetRemoveGroup } = res.data
      expect(jobSheetRemoveGroup.n).toEqual(1)
      expect(jobSheetRemoveGroup.ok).toEqual(1)
    }

    if (newOtherID) {
      const res = await mutate({
        mutation: REMOVE_OTHER,
        variables: { id: newOtherID },
      })
      const { jobSheetRemoveOther } = res.data
      expect(jobSheetRemoveOther.n).toEqual(1)
      expect(jobSheetRemoveOther.ok).toEqual(1)
    }

    if (newWindowID) {
      const res = await mutate({
        mutation: REMOVE_WINDOW,
        variables: { id: newWindowID },
      })
      const { jobSheetRemoveWindow } = res.data
      expect(jobSheetRemoveWindow.n).toEqual(1)
      expect(jobSheetRemoveWindow.ok).toEqual(1)
    }
  })

  test('persistJobsheet', async () => {
    const res = await mutate({
      mutation: PERSIST_JOBSHEET,
      variables: { addressInput: address, jobSheetInput: jobsheet },
    })
    const { jobSheetPersist } = res.data
    newJobSheetID = jobSheetPersist._id
    expect(jobSheetPersist).toBeTruthy()
  })

  test('jobSheetPersistFeatures', async () => {
    const res = await mutate({
      mutation: PERSIST_FEATURES,
      variables: { id: newJobSheetID, features },
    })
    const { jobSheetPersistFeatures: jobSheet } = res.data
    expect(jobSheet.features).toEqual(features)
  })

  test('jobSheetPersistGroup', async () => {
    const res = await mutate({
      mutation: PERSIST_GROUP,
      variables: { input: groupInput },
    })
    const { jobSheetPersistGroup } = res.data
    newGroupID = jobSheetPersistGroup._id
    expect(jobSheetPersistGroup).toBeTruthy()
  })

  test('jobSheetPersistOther', async () => {
    const res = await mutate({
      mutation: PERSIST_OTHER,
      variables: { input: otherInput },
    })
    const { jobSheetPersistOther } = res.data
    newOtherID = jobSheetPersistOther._id
    expect(jobSheetPersistOther).toBeTruthy()
  })

  test('jobSheetPersistWindow', async () => {
    const res = await mutate({
      mutation: PERSIST_WINDOW,
      variables: { input: windowInput },
    })
    const { jobSheetPersistWindow } = res.data
    newWindowID = jobSheetPersistWindow._id
    expect(jobSheetPersistWindow).toBeTruthy()
  })
})
