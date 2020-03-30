/* eslint-disable import/prefer-default-export, no-underscore-dangle */
import mongoose from 'mongoose'
import ramda from 'ramda'

import Address from '../address/model'
import JobSheet from './model'
import JobSheetGroup from '../jobSheetGroup/model'
import JobSheetWindow from '../jobSheetWindow/model'
import JobSheetOther from '../jobSheetOther/model'
import Quote from '../quote/model'
import QuoteMeta from '../quote/metaModel'

const searchByCustomer = async (customerID) => {
  const q = {}
  if (!customerID) {
    throw new Error('Missing customer id in jobsheet query')
  }
  q.customerID = mongoose.Types.ObjectId(customerID)

  let items
  try {
    items = await JobSheet.find(q)
      .populate('addressID')
      .sort({ updatedAt: -1 })
  } catch (e) {
    throw new Error(e)
  }
  return items
}

const jobSheetData = async (jobSheetID) => {
  let sheet
  const q = { jobsheetID: jobSheetID }

  try {
    sheet = {
      jobsheet: await JobSheet.findById(jobSheetID).populate('addressID').populate('customerID'),
      windows: await JobSheetWindow.find(q).populate('productID').sort({ createdAt: 1 }),
      groups: await JobSheetGroup.find(q).sort({ createdAt: 1 }),
      other: await JobSheetOther.find(q).sort({ createdAt: 1 }),
    }
  } catch (e) {
    throw new Error(e)
  }

  // Now fetch products for group items and populate
  const productIDs = []
  sheet.groups.forEach((grp) => {
    grp.items.forEach((item) => {
      productIDs.push(item.productID)
    })
  })

  return sheet
}

const jobSheetDuplicate = async (id) => {
  const jobSheet = {}
  let newJobSheet
  let sheet
  const q = { jobsheetID: id }

  try {
    sheet = {
      jobsheet: await JobSheet.findById(id),
      windows: await JobSheetWindow.find(q),
      groups: await JobSheetGroup.find(q),
      other: await JobSheetOther.find(q),
    }
  } catch (e) {
    throw new Error(e)
  }
  jobSheet.addressID = sheet.jobsheet.addressID
  jobSheet.duplicateNumber = sheet.jobsheet.number
  jobSheet.customerID = sheet.jobsheet.customerID
  jobSheet.features = sheet.jobsheet.features

  let jsNum
  try {
    jsNum = await QuoteMeta.fetchNextJobSheetNum()
  } catch (e) {
    throw new Error(e)
  }
  jobSheet.number = jsNum.value

  try {
    newJobSheet = await JobSheet.create(jobSheet)
  } catch (e) {
    throw new Error(e)
  }

  // Now create windows, groups and other
  const windows = []
  if (sheet.windows.length) {
    sheet.windows.forEach((win) => {
      const winCopy = win.toJSON()
      delete winCopy._id
      winCopy.jobsheetID = newJobSheet._id
      windows.push(JobSheetWindow.create(winCopy))
    })

    try {
      await Promise.all(windows)
    } catch (e) {
      throw new Error(e)
    }
  }

  const groups = []
  if (sheet.groups.length) {
    sheet.groups.forEach((win) => {
      const grpCopy = win.toJSON()
      delete grpCopy._id
      grpCopy.jobsheetID = newJobSheet._id
      groups.push(JobSheetGroup.create(grpCopy))
    })

    try {
      await Promise.all(groups)
    } catch (e) {
      throw new Error(e)
    }
  }

  const other = []
  if (sheet.other.length) {
    sheet.other.forEach((win) => {
      const otherCopy = win.toJSON()
      delete otherCopy._id
      otherCopy.jobsheetID = newJobSheet._id
      other.push(JobSheetOther.create(otherCopy))
    })

    try {
      await Promise.all(other)
    } catch (e) {
      throw new Error(e)
    }
  }
  // console.log('newJobSheet:', newJobSheet)

  return newJobSheet
}

const jobSheetPersist = async ({ addressInput, jobSheetInput }) => {
  let addressReturn
  const jobSheet = ramda.clone(jobSheetInput)

  // We're either given an address object for a new address location
  // or addressID for existing address, typically the customers` current residence
  if (!addressInput) {
    throw new Error('Missing address input for jobsheet')
  }

  let jsNum
  try {
    jsNum = await QuoteMeta.fetchNextJobSheetNum()
  } catch (e) {
    throw new Error(e)
  }
  jobSheet.number = jsNum.value

  try {
    addressReturn = await Address.create(addressInput)
  } catch (e) {
    throw new Error(e)
  }

  // Should be safe at this point to assign addressID
  jobSheet.addressID = addressReturn._id

  // Now create jobSheet
  try {
    return await JobSheet.create(jobSheet)
  } catch (e) {
    throw new Error(e)
  }
}

const jobSheetRemove = async (id) => {
  const jobsheetID = mongoose.Types.ObjectId(id)
  let jsReturn

  // Test if any quotes associated with jobsheet
  let nQuotes = null
  const quoteQuery = {
    jobsheetID: id,
  }
  try {
    nQuotes = await Quote.countDocuments(quoteQuery)
  } catch (e) {
    throw new Error(e)
  }
  if (nQuotes) {
    throw new Error(`There are ${nQuotes} Quotes associated with this Job Sheet`)
  }

  // Fetch jobsheet
  let jobSh
  try {
    jobSh = await JobSheet.findById(id)
  } catch (e) {
    throw new Error(e)
  }

  // delete associated address record, but... only if not associated with other jobsheets
  const q = { addressID: jobSh.addressID }
  let dupSheets
  try {
    dupSheets = await JobSheet.find(q)
  } catch (e) {
    throw new Error(e)
  }

  const canDelete = dupSheets.length <= 1
  if (canDelete) {
    try {
      await Address.deleteOne({ _id: jobSh.addressID })
    } catch (e) {
      throw new Error(e)
    }
  }

  // Start with the windows
  try {
    await JobSheetWindow.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Then groups
  try {
    await JobSheetGroup.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Now other items windows
  try {
    await JobSheetOther.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Finally the actual jobsheet
  try {
    jsReturn = await JobSheet.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return jsReturn
}

const jobSheetPersistFeatures = async ({ features, id }) => {
  const jobsheetID = mongoose.Types.ObjectId(id)

  try {
    const jsReturn = await JobSheet.findOneAndUpdate(
      { _id: jobsheetID },
      { features },
      { new: true },
    )
    return jsReturn
  } catch (e) {
    throw new Error(e)
  }
}

const jobSheetPersistGroup = async (groupInput) => {
  let groupReturn
  try {
    if (groupInput && groupInput._id) {
      groupReturn = await JobSheetGroup.findOneAndUpdate(
        { _id: groupInput._id },
        groupInput,
        { new: true },
      )
    } else {
      groupReturn = await JobSheetGroup.create(groupInput)
    }
    return groupReturn
  } catch (e) {
    throw new Error(e)
  }
}

const jobSheetRemoveGroup = async (id) => {
  let groupReturn

  // start by checking if window exists in existing quote
  const q = { 'items.group': id }
  let quoteReturn
  try {
    quoteReturn = await Quote.find(q).countDocuments()
  } catch (e) {
    throw new Error(e)
  }
  if (quoteReturn > 0) {
    throw new Error(`There are ${quoteReturn} quotes using this item.`)
  }

  try {
    groupReturn = JobSheetGroup.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return groupReturn
}

const jobSheetPersistOther = async (otherInput) => {
  let otherReturn
  try {
    if (otherInput && otherInput._id) {
      otherReturn = await JobSheetOther.findOneAndUpdate(
        { _id: otherInput._id },
        otherInput,
        { new: true },
      )
    } else {
      otherReturn = await JobSheetOther.create(otherInput)
    }
  } catch (e) {
    throw new Error(e)
  }
  return otherReturn
}

const jobSheetRemoveOther = async (id) => {
  // start by checking if window in existing quote
  const q = { 'items.other': id }
  let quoteReturn
  try {
    quoteReturn = await Quote.find(q).countDocuments()
  } catch (e) {
    throw new Error(e)
  }
  if (quoteReturn > 0) {
    throw new Error(`There are ${quoteReturn} quotes using this item.`)
  }

  try {
    const otherReturn = JobSheetOther.deleteOne({ _id: id })
    return otherReturn
  } catch (e) {
    throw new Error(e)
  }
}

export const jobSheetPersistWindow = async (input) => {
  let winReturn
  try {
    if (input && input._id) {
      winReturn = await JobSheetWindow.findOneAndUpdate(
        { _id: input._id },
        input,
        { new: true },
      )
    } else {
      winReturn = await JobSheetWindow.create(input)
    }
    return winReturn
  } catch (e) {
    throw new Error(e)
  }
}

export const jobSheetRemoveWindow = async (id) => {
  // start by checking if window in existing quote
  const q = { 'items.window': id }
  let quoteReturn
  try {
    quoteReturn = await Quote.find(q).countDocuments()
  } catch (e) {
    throw new Error(e)
  }
  if (quoteReturn > 0) {
    throw new Error(`There are ${quoteReturn} quotes using this item.`)
  }

  try {
    const winReturn = JobSheetWindow.deleteOne({ _id: id })
    return winReturn
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    searchJobSheetsByCustomer: (_, { customerID }) => searchByCustomer(customerID),
    jobSheetData: (_, { jobSheetID }) => jobSheetData(jobSheetID),
  },
  Mutation: {
    jobSheetDuplicate: (_, { id }) => jobSheetDuplicate(id),
    jobSheetPersist: (
      _, { addressInput, jobSheetInput },
    ) => jobSheetPersist({ addressInput, jobSheetInput }),
    jobSheetPersistFeatures: (_, { features, id }) => jobSheetPersistFeatures({ features, id }),
    jobSheetPersistGroup: (_, { input }) => jobSheetPersistGroup(input),
    jobSheetPersistOther: (_, { input }) => jobSheetPersistOther(input),
    jobSheetPersistWindow: (_, { input }) => jobSheetPersistWindow(input),
    jobSheetRemove: (_, { id }) => jobSheetRemove(id),
    jobSheetRemoveGroup: (_, { id }) => jobSheetRemoveGroup(id),
    jobSheetRemoveOther: (_, { id }) => jobSheetRemoveOther(id),
    jobSheetRemoveWindow: (_, { id }) => jobSheetRemoveWindow(id),
  },
}
