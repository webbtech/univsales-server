/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose'
import moment from 'moment'
import ramda from 'ramda'
import fetch from 'node-fetch'
import AWS from 'aws-sdk'

import { indexOf } from 'lodash'
import Address from '../address/model'
import Quote from './model'
import QuoteMeta from './metaModel'
import { savePDF, saveWrkShtPDF } from '../../utils'

const LATEST_LIMIT = 100
const MAX_DISTANCE_DEFAULT = 10000

const DOC_TYPE_QUOTE = 'quote'
const DOC_TYPE_INVOICE = 'invoice'
const validDocTypes = [DOC_TYPE_INVOICE, DOC_TYPE_QUOTE]

const isProdEnv = process.env.NODE_ENV === 'production'

const defaults = {
  discount: {
    description: '',
    discount: 0.00,
    tax: 0.00,
    subtotal: 0.00,
    total: 0.00,
  },
  itemCosts: {
    group: 0.00,
    other: 0.00,
    window: 0.00,
  },
  quotePrice: {
    subtotal: 0.00,
    tax: 0.00,
    total: 0.00,
  },
}

const fetchAddress = async (addressID) => {
  let address
  try {
    address = await Address.findById(addressID)
  } catch (e) {
    throw new Error(e)
  }
  return address
}

const searchByCustomer = async (customerID) => {
  const q = {
    customerID: mongoose.Types.ObjectId(customerID),
  }
  const qts = Quote.find(q).populate('jobsheetID').sort({ updatedAt: -1 })

  let quotes
  try {
    quotes = await qts
  } catch (e) {
    throw new Error(e)
  }

  // We could look into using the mongoose cursor and transform methods here
  // see: https://mongoosejs.com/docs/api.html#query_Query-cursor
  // fixme: using for/of and await in loop not good practice
  try {
    for (const quote of quotes) { // eslint-disable-line
      quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID) // eslint-disable-line
    }
  } catch (e) {
    throw new Error(e)
  }
  // Now create totals
  let totalInvoiced = 0.00
  let totalOutstanding = 0.00
  totalInvoiced = quotes.reduce((accum, val) => accum + val.quotePrice.total, 0.00)
  totalOutstanding = quotes.reduce((accum, val) => accum + val.quotePrice.outstanding, 0.00)

  return {
    quotes,
    totalInvoiced,
    totalOutstanding,
  }
}

const findOne = async (quoteID) => {
  try {
    const quote = await Quote.findById(quoteID)
      .populate('customerID')
      .populate('jobsheetID')
    quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID)
    return quote
  } catch (e) {
    throw new Error(e)
  }
}

const searchQuotes = async ({ closed, invoiced, year }) => {
  const q = {}
  q.invoiced = invoiced

  if (invoiced && closed !== undefined) {
    q.closed = closed
  }

  let qts

  const yr = Number(year)
  if (!Number.isNaN(yr) && yr > 0) {
    const sDte = moment().year(year).startOf('year').utc()
    const eDte = sDte.clone().endOf('year').utc()
    q.createdAt = { $gte: sDte, $lte: eDte }

    qts = Quote.find(q)
      .populate('customerID')
      .populate('jobsheetID')
      .sort({ updatedAt: -1 })
  } else { // searching latest
    qts = Quote.find(q)
      .populate('customerID')
      .populate('jobsheetID')
      .sort({ updatedAt: -1 })
      .limit(LATEST_LIMIT)
  }

  let quotes
  try {
    quotes = await qts
  } catch (e) {
    throw new Error(e)
  }

  // We could look into using the mongoose cursor and transform methods here
  // see: https://mongoosejs.com/docs/api.html#query_Query-cursor

  // FIXME: using for/of and await in loop not good practice
  try {
    for (const quote of quotes) { // eslint-disable-line
      quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID) // eslint-disable-line
    }
  } catch (e) {
    throw new Error(e)
  }
  // Now create totals
  let totalInvoiced = 0.00
  let totalOutstanding = 0.00
  if (invoiced) {
    totalInvoiced = quotes.reduce((accum, val) => accum + val.quotePrice.total, 0.00)
    totalOutstanding = quotes.reduce((accum, val) => accum + val.quotePrice.outstanding, 0.00)
  }

  return {
    quotes,
    totalInvoiced,
    totalOutstanding,
  }
}

const searchCustomerRecent = async () => {
  const pipeline = [
    {
      $group: {
        _id: '$customerID',
        customerID: { $last: '$customerID' },
        quotePrice: { $last: '$quotePrice' },
        invoiced: { $last: '$invoiced' },
        number: { $last: '$number' },
        updatedAt: { $last: '$updatedAt' },
      },
    },
    {
      $sort: { updatedAt: -1 },
    },
    { $limit: LATEST_LIMIT },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerID',
        foreignField: '_id',
        as: 'customer',
      },
    },
    {
      $unwind: { path: '$customer' },
    },
    {
      $lookup: {
        from: 'addresses',
        let: { customerID: '$customerID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$customerID', '$$customerID'] },
                  { $eq: ['$associate', 'customer'] },
                ],
              },
            },
          },
          {
            $project: { street1: 1, city: 1 },
          },
        ],
        as: 'address',
      },
    },
    { $unwind: { path: '$address' } },
  ]

  try {
    const res = await Quote.aggregate(pipeline)
    return res
  } catch (e) {
    throw new Error(e)
  }
}

const quoteNearbyJobs = async (input) => {
  const { coordinates } = input
  let { maxDistance } = input
  if (!maxDistance) maxDistance = MAX_DISTANCE_DEFAULT

  const pipeline = [
    [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates,
          },
          distanceField: 'dist.calculated',
          maxDistance,
          spherical: true,
          query: { associate: 'jobsheet' },
          includeLocs: 'dist.location',
        },
      },
      {
        $group: {
          _id: {
            location: '$location.coordinates',
          },
          city: { $first: '$city' },
          street1: { $first: '$street1' },
          postalCode: { $first: '$postalCode' },
          provinceCode: { $first: '$provinceCode' },
          customerID: { $first: '$customerID' },
          dist: { $first: '$dist' },
          location: { $first: '$location' },
          addressID: { $first: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'quotes',
          let: { customerID: '$customerID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$customerID', '$customerID'] },
                    { $eq: ['$closed', true] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                closed: 1,
                number: 1,
              },
            },
            { $limit: 1 },
          ],
          as: 'quote',
        },
      },
      { $match: { 'quote.closed': true } },
      { $sort: { 'dist.calculated': 1 } },
      { $limit: 10 },
      { $unwind: { path: '$quote' } },
    ],
  ]

  let res
  try {
    res = await Address.aggregate(pipeline)
  } catch (e) {
    throw new Error(e)
  }

  // loop through and create a cleanup address
  // destructuring would be nice here, but doesn't work with node10, (I'm assuming)
  const addresses = res.map((doc) => {
    doc._id = doc.addressID // eslint-disable-line no-param-reassign
    delete doc.addressID // eslint-disable-line no-param-reassign
    delete doc.quote // eslint-disable-line no-param-reassign
    return doc
  })
  // console.log('addresses:', addresses)

  return addresses
}

const quotePersist = async (input, cfg, token) => {
  const quote = ramda.clone(input)
  const isNew = !quote._id

  if (isNew) {
    let quoteNum
    try {
      quoteNum = await QuoteMeta.fetchNextQuoteNum()
    } catch (e) {
      throw new Error(e)
    }
    quote.number = quoteNum.value
  }

  let quoteReturn
  try {
    if (isNew) {
      // FIXME: convert to object spread
      // eslint-disable-next-line prefer-object-spread
      const quoteWithDefaults = Object.assign({}, quote, defaults)
      quoteReturn = await Quote.create(quoteWithDefaults)
    } else {
      quoteReturn = await Quote.findOneAndUpdate(
        { _id: quote._id },
        quote,
        { new: true },
      )
    }
  } catch (e) {
    throw new Error(e)
  }

  // Save PDF
  if (isProdEnv) {
    const pdfArgs = {
      quoteID: quoteReturn._id,
      docType: 'quote',
    }
    if (!isNew) {
      try {
        const ret = await savePDF(pdfArgs, cfg, token)
        // we only want to return error
        if (typeof ret === 'object') {
          console.info('ret on savePDF in resolver:', ret) // eslint-disable-line no-console
          return ret
        }
      } catch (e) {
        throw new Error(e)
      }
    }
  }
  console.info('Successfully saved quote with id: ', quoteReturn._id) // eslint-disable-line no-console
  return quoteReturn
}

const quoteRemove = async (id, cfg) => {
  let quote

  try {
    quote = await Quote.findById(id, { number: 1, invoiced: 1, 'quotePrice.payments': 1 })
  } catch (e) {
    throw new Error(e)
  }
  if (!quote) return false

  if (quote.quotePrice.payments > 0) {
    throw new Error('Cannot delete an invoice with payments')
  }

  if (quote.invoiced && isProdEnv) {
    deletePDFs({ docType: 'invoice', number: quote.number }, cfg)
    deletePDFs({ docType: 'worksheet', number: quote.number }, cfg)
    await Quote.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      { invoiced: false, 'quotePrice.outstanding': 0 },
      { new: true },
    )
    return {
      n: 1,
      ok: 1,
    }
  }

  if (isProdEnv) {
    await deletePDFs({ docType: 'quote', number: quote.number }, cfg)
  }

  try {
    const quoteReturn = await Quote.deleteOne({ _id: id })
    return quoteReturn
  } catch (e) {
    throw new Error(e)
  }
}

const createInvoice = async (id, cfg, token) => {
  let quote
  try {
    quote = await Quote.findById(id)
  } catch (e) {
    throw new Error(e)
  }

  // Save PDF
  if (isProdEnv) {
    const pdfArgs = {
      quoteID: id,
      docType: 'invoice',
    }
    try {
      const ret = await savePDF(pdfArgs, cfg, token)
      // we only want to return error
      if (typeof ret === 'object') {
        console.info('ret on savePDF in resolver:', ret) // eslint-disable-line no-console
        return ret
      }
    } catch (e) {
      throw new Error(e)
    }

    // Save worksheet
    const wrkShtArgs = {
      quoteID: id,
      docType: 'invoice',
    }
    try {
      const ret = await saveWrkShtPDF(wrkShtArgs, cfg, token)
      // we only want to return error
      if (typeof ret === 'object') {
        console.info('ret on saveWrkShtPDF in resolver:', ret) // eslint-disable-line no-console
        return ret
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  return Quote.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { invoiced: true, 'quotePrice.outstanding': quote.quotePrice.total },
    { new: true },
  )
}

const quotePersistDiscount = async (input) => {
  const { _id, discount, quotePrice } = input

  try {
    const quoteReturn = await Quote.findOneAndUpdate(
      { _id },
      { discount, quotePrice },
      { new: true },
    )
    return quoteReturn
  } catch (e) {
    throw new Error(e)
  }
}

// ========== PDF functions ============================================================

const createPDF = async (input, cfg, token) => {
  if (validDocTypes.includes(input.docType) === false) {
    throw new Error('Invalid docType requested')
  }
  if (mongoose.Types.ObjectId.isValid(input.quoteID) === false) {
    throw new Error('Invalid quoteID argument')
  }

  const { quoteID } = input
  const docType = validDocTypes[validDocTypes.indexOf(input.docType)]
  const pdfArgs = {
    quoteID,
    docType,
  }

  try {
    const ret = await savePDF(pdfArgs, cfg, token)
    // If return is object we likely have error
    if (typeof ret === 'object') {
      console.info('ret on savePDF in resolver:', ret) // eslint-disable-line no-console
      return ret
    }
    return {
      n: 1,
      ok: ret,
    }
  } catch (e) {
    throw new Error(e)
  }
}

// todo: nice if there was a way to authenticate without using accessKeyId and screenAccessKey
const deletePDFs = async (args, cfg) => {
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: cfg.awsAccessKeyId,
    secretAccessKey: cfg.awsSecretAccessKey,
  })
  const params = {
    Bucket: cfg.s3Bucket,
    Prefix: args.docType,
  }

  // fetch objects and assemble array of objects to delete
  let S3Objects
  try {
    S3Objects = await s3.listObjectsV2(params).promise()
  } catch (e) {
    throw new Error(e)
  }
  const retObjects = S3Objects.Contents.filter((o) => o.Key.indexOf(args.number) > -1)
  if (!retObjects.length) return false
  const delObjects = retObjects.map((o) => ({ Key: o.Key }))

  // now delete
  const delParams = {
    Bucket: cfg.s3Bucket,
    Delete: {
      Objects: delObjects,
    },
  }
  let delRet
  try {
    delRet = await s3.deleteObjects(delParams).promise()
  } catch (e) {
    throw new Error(e)
  }
  return delRet
}

const pdfSignedURL = async (cfg, input, token) => {
  const payload = ramda.clone(input)
  const url = cfg.PDFCreateURLURI

  try {
    const response = await fetch(url, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    return await response.json()
  } catch (e) {
    throw new Error(e)
  }
}

// ========== Resolver Opject =================================================
export const resolvers = {
  Query: {
    pdfSignedURL: (_, { input }, { cfg, token }) => pdfSignedURL(cfg, input, token),
    quote: (_, { quoteID }) => findOne(quoteID),
    searchQuotesByCustomer: (_, { customerID }) => searchByCustomer(customerID),
    searchCustomerRecent: () => searchCustomerRecent(),
    searchQuotes: (_, {
      closed,
      invoiced = false,
      year,
    }) => searchQuotes({ closed, invoiced, year }),
    quoteNearbyJobs: (_, { input }) => quoteNearbyJobs(input),
  },
  Mutation: {
    createInvoice: (_, { id }, { cfg, token }) => createInvoice(id, cfg, token),
    createPDF: (_, { input }, { cfg, token }) => createPDF(input, cfg, token),
    quotePersist: (_, { input }, { cfg, token }) => quotePersist(input, cfg, token),
    quotePersistDiscount: (_, { input }) => quotePersistDiscount(input),
    quoteRemove: (_, { id }, { cfg }) => quoteRemove(id, cfg),
  },
}
