import { gql } from 'apollo-server'

export default gql`
extend type Mutation {
  createInvoice(id: ID!): Quote
  quotePersist(input: QuoteInput!): Quote
  quotePersistDiscount(input: QuoteDiscountInput!): Quote
  quoteRemove(id: ID!): DBResult
}

extend type Query {
  quote(quoteID: ID!): Quote
  quoteNearbyJobs(input: AddressGeoInput): [AddressGeo]
  pdfSignedURL(input: SignedURLInput!): PDFSignedURL
  searchCustomerRecent: [QuoteRecent]
  searchQuotes(closed: Boolean, invoiced: Boolean, year: String): Quotes
  searchQuotesByCustomer(customerID: ID!): Quotes
}

type PDFSignedURL {
  code: Int
  data: SignedURLData
  message: String
  status: String
  timestamp: Int
}

type Quote {
  _id: ID!
  closed: Boolean!
  createdAt: String
  customerID: Customer
  # deposit: Boolean!
  discount: QuoteDiscount
  invoiced: Boolean!
  itemCosts: QuoteItemCosts
  itemSummary: QuoteItemSummary
  items: QuoteItems
  jobsheetID: JobSheet
  number: Int!
  quotePrice: QuotePrice
  updatedAt: String
  version: Int!
}

type QuoteDiscount {
  description: String
  discount: Float
  subtotal: Float
  tax: Float
  total: Float
}

type QuoteItemCosts {
  group: Float
  other: Float
  subtotal: Float
  window: Float
}

type QuoteItemSummary {
  group: QuoteItemSummaryDetails
  other: QuoteItemSummaryDetails
  window: QuoteItemSummaryDetails
}

type QuoteItemSummaryCosts {
  extendTotal: Float
  extendUnit: Float
  netUnit: Float
}

type QuoteItemSummaryDetails {
  items: [QuoteItemSummaryItems]
  totals: QuoteItemSummaryExtendTotal
}

type QuoteItemSummaryExtendTotal {
  extendTotal: Float
}

type QuoteItemSummaryItems {
  costs: QuoteItemSummaryCosts
  description: String
  qty: Int
  rooms: String
  specs: JSON
}

type QuoteItems {
  group: [String]
  other: [String]
  window: [String]
}

type QuotePrice {
  outstanding: Float
  payments: Float
  subtotal: Float
  tax: Float
  total: Float
}

type QuoteRecent {
  _id: ID!
  address: QuoteRecentAddress
  customer: Customer
  customerID: ID
  invoiced: Boolean
  number: Int
  quotePrice: QuotePrice
  updatedAt: String
  version: Int
}

type QuoteRecentAddress {
  _id: ID
  city: String
  street1: String
}

type Quotes {
  quotes: [Quote]!
  totalInvoiced: Float
  totalOutstanding: Float
}

type SignedURLData {
  url: String
}

#
## ================================== Inputs ==================================
#

input DiscountInput {
  description: String
  discount: Float
  subtotal: Float
  tax: Float
  total: Float
}

input ItemCostsInput {
  group: Float
  other: Float
  subtotal: Float
  window: Float
}

input ItemSummaryCostsInput {
  extendTotal: Float
  extendUnit: Float
  netUnit: Float
}

input ItemSummaryDetailsInput {
  items: [ItemSummaryItemsInput]
  totals: ItemSummaryExtendTotalInput
}

input ItemSummaryExtendTotalInput {
  extendTotal: Float
}

input ItemSummaryInput {
  group: ItemSummaryDetailsInput
  other: ItemSummaryDetailsInput
  window: ItemSummaryDetailsInput
}

input ItemSummaryItemsInput {
  costs: ItemSummaryCostsInput
  description: String
  qty: Int
  rooms: String
  specs: JSON
}

input ItemsInput {
  group: [String]
  other: [String]
  window: [String]
}

input QuoteDiscountInput {
  _id: ID!
  discount: DiscountInput!
  quotePrice: QuotePriceInput!
}

input QuoteInput {
  _id: ID
  customerID: ID!
  discount: DiscountInput
  features: String
  itemCosts: ItemCostsInput
  itemSummary: ItemSummaryInput
  items: ItemsInput
  jobsheetID: ID!
  quotePrice: QuotePriceInput
  version: Int
}

input QuotePriceInput {
  outstanding: Float
  payments: Float
  subtotal: Float
  tax: Float
  total: Float
}

input SignedURLInput {
  number: Int!
  type: String!
  version: Int
}
`
