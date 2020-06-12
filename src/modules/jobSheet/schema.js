import { gql } from 'apollo-server-lambda'

export default gql`
extend type Mutation {
  jobSheetDuplicate(id: ID!): JobSheet
  jobSheetPersist(addressInput: AddressInput, jobSheetInput: JobSheetInput!): JobSheet
  jobSheetPersistFeatures(features: String!, id: ID!): JobSheet
  jobSheetPersistGroup(input: GroupInput!): JobSheetGroup
  jobSheetPersistOther(input: OtherInput!): JobSheetOther
  jobSheetPersistWindow(input: WindowInput!): JobSheetWindow
  jobSheetRemove(id: ID!): DBResult
  jobSheetRemoveGroup(id: ID!): DBResult
  jobSheetRemoveOther(id: ID!): DBResult
  jobSheetRemoveWindow(id: ID!): DBResult
}
extend type Query {
  jobSheetData(jobSheetID: ID!): JobSheetData
  jobSheetGroup(groupID: ID!): JobSheetGroup
  jobSheetOther(otherID: ID!): JobSheetOther
  jobSheetWindow(windowID: ID!): JobSheetWindow
  searchJobSheetsByCustomer(customerID: ID!): [JobSheet]
}

#
## ================================== Types ==================================
#

type GroupItemCosts {
  extendTotal: Float
  extendUnit: Float
}

type GroupItemDims {
  height: WindowDims
  width: WindowDims
}

type GroupItemSpecs {
  extendSqft: Int
  options: String
  overSize: Int
  sqft: Int
}

type GroupWindowDims {
  decimal: Float
  diff: Float
  fraction: String
  inch: Int
}

type JobSheet {
  _id: ID!
  addressID: Address
  duplicateNumber: Int
  createdAt: String
  customerID: Customer
  features: String
  number: Int!
  updatedAt: String
}

type JobSheetData {
  groups: [JobSheetGroup]
  jobsheet: JobSheet
  other: [JobSheetOther]
  windows: [JobSheetWindow]
}

type JobSheetGroup {
  _id: ID!
  costs: JobSheetGroupCosts
  createdAt: String
  dims: JobSheetGroupDims
  items: [JobSheetGroupItem]
  jobsheetID: ID!
  qty: Int
  rooms: [String]
  specs: JobSheetGroupSpecs
  updatedAt: String
}

type JobSheetGroupCosts {
  discounted: Float
  discountedAmount: Float
  extendTotal: Float
  extendUnit: Float
  install: Float
  installType: Float
  netUnit: Float
  options: Float
  trim: Float
  windows: Float
}

type JobSheetGroupDims {
  height: GroupWindowDims
  width: GroupWindowDims
}

type JobSheetGroupItem {
  _id: ID
  costs: GroupItemCosts
  dims: GroupItemDims
  product: Product
  productID: ID
  qty: Int
  specs: GroupItemSpecs
}

type JobSheetGroupSpecs {
  groupTypeDescription: String
  installType: String
  options: String
  optionsDoc: OptionsDoc
  sqft: Int
  style: String
  trim: String
}

type JobSheetItemCosts {
  discounted: Float
  discountedAmount: Float
  extendTotal: Float
  extendUnit: Float
  install: Float
  installType: Float
  netUnit: Float
  options: Float
  trim: Float
  window: Float
}

type JobSheetOther {
  _id: ID!
  costs: OtherCosts
  createdAt: String
  description: String
  jobsheetID: ID
  product: String
  qty: Int
  rooms: [String]
  specs: OtherSpecs
  updatedAt: String
}

type JobSheetWindow {
  _id: ID!
  costs: JobSheetItemCosts
  createdAt: String
  dims: JobSheetWindowDims
  jobsheetID: ID
  productID: Product
  qty: Int
  rooms: [String]
  specs: JobSheetWindowSpecs
  updatedAt: String
}

type JobSheetWindowDims {
  height: WindowDims
  width: WindowDims
}

type JobSheetWindowSpecs {
  installType: String
  options: String
  optionsDoc: OptionsDoc
  overSize: Int
  sqft: Int
  trim: String
}

type OtherCosts {
  extendTotal: Float
  extendUnit: Float
}

type OtherSpecs {
  location: String
  options: String
}

type WindowDims {
  decimal: Float
  fraction: String
  inch: Int
  overSize: Int
  round: Int
  underSize: Int
}

type OptionsDoc {
  color: String
  customColor: String,
  darker: Boolean,
  extraDetails: String,
  window: [String],
}

#
## ================================== Inputs ==================================
#

input GroupCostsInput {
  discountAmount: Float
  discounted: Float
  extendTotal: Float
  extendUnit: Float
  install: Float
  installType: Float
  netUnit: Float
  options: Float
  trim: Float
  windows: Float
}

input GroupDimsInput {
  decimal: Float
  diff: Float
  fraction: String
  inch: Int
}

input GroupHWDimsInput {
  height: GroupDimsInput
  width: GroupDimsInput
}

input GroupInput {
  _id: ID
  costs: GroupCostsInput
  dims: GroupHWDimsInput
  items: [GroupItemInput]
  jobsheetID: ID!
  qty: Int
  rooms: [String]
  specs: GroupSpecsInput
}

input GroupItemCostsInput {
  extendTotal: Float
  extendUnit: Float
}

input GroupItemInput {
  _id: ID!
  costs: GroupItemCostsInput
  dims: WindowHWDimsInput
  product: GroupItemProductInput
  productID: ID!
  qty: Int
  specs: GroupItemSpecsInput
}

input GroupItemProductInput {
  name: String
}

input GroupItemSpecsInput {
  extendSqft: Int
  options: String
  overSize: Int
  sqft: Int
}

input GroupSpecsInput {
  groupTypeDescription: String
  installType: String
  options: String
  optionsDoc: OptionsDocInput
  sqft: Int
  style: String
  trim: String
}

input JobSheetInput {
  _id: ID
  customerID: ID!
  features: String
}

input OtherCostsInput {
  extendTotal: Float
  extendUnit: Float
}

input OtherInput {
  _id: ID
  costs: OtherCostsInput
  description: String
  jobsheetID: ID
  product: String
  qty: Int
  rooms: [String]
  specs: OtherSpecsInput
}

input OtherSpecsInput {
  location: String
  options: String
}

input WindowCostsInput {
  discounted: Float
  discountedAmount: Float
  extendTotal: Float
  extendUnit: Float
  install: Float
  installType: Float
  netUnit: Float
  options: Float
  trim: Float
  window: Float
}

input WindowDimsInput {
  decimal: Float
  fraction: String
  inch: Int
  overSize: Int
  round: Int
  underSize: Int
}

input WindowHWDimsInput {
  height: WindowDimsInput
  width: WindowDimsInput
}

input WindowInput {
  _id: ID
  costs: WindowCostsInput
  dims: WindowHWDimsInput
  jobsheetID: ID!
  productID: ID!
  qty: Int
  rooms: [String]
  specs: WindowSpecsInput
}

input WindowSpecsInput {
  extendSqft: Int
  installType: String
  options: String
  optionsDoc: OptionsDocInput
  overSize: Int
  sqft: Int
  trim: String
}

input OptionsDocInput {
  color: String
  customColor: String,
  darker: Boolean,
  extraDetails: String,
  window: [String],
}
`
