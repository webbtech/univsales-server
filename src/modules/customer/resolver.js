/* eslint-disable import/prefer-default-export, no-underscore-dangle */
import ramda from 'ramda'
import mongoose from 'mongoose'

import Customer from './model'
import Address from '../address/model'
import JobSheet from '../jobSheet/model'
import { phoneRegex } from '../../utils'

const CUSTOMER_LIMIT = 100

const find = async (customerID) => {
  let customerRet
  try {
    customerRet = await Customer.findById(customerID)
  } catch (e) {
    throw new Error(e)
  }

  // Now their customer associated address
  try {
    customerRet.address = await Address.findOne({ customerID: customerRet._id, associate: 'customer' })
  } catch (e) {
    throw new Error(e)
  }
  return customerRet
}

const searchByField = async ({ field, value, active }) => {
  let regex
  if (field === 'phones.number') {
    regex = new RegExp(`${phoneRegex(value)}`)
  } else {
    regex = new RegExp(`^${value}`, 'i')
  }

  const pipeline = [
    {
      $match: {
        active,
        [field]: regex,
      },
    },
    {
      $lookup: {
        from: 'addresses',
        let: {
          customerID: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$$customerID', '$customerID'],
                  },
                  {
                    $eq: ['$associate', 'customer'],
                  },
                ],
              },
            },
          },
        ],
        as: 'address',
      },
    },
    { $unwind: '$address' },
    { $sort: { 'name.last': 1 } },
    { $limit: CUSTOMER_LIMIT },
  ]

  try {
    const res = await Customer.aggregate(pipeline)
    return res
  } catch (e) {
    throw new Error(e)
  }
}

/*
  Search by jobsheet associated address
*/
const searchByAddress = async ({ value }) => {
  if (!value) {
    throw new Error('Missing value in searchByAddress')
  }
  const q = {}
  q.street1 = new RegExp(`^[0-9]+\\s${value}`, 'i')
  q.associate = 'jobsheet'
  let addresses
  try {
    addresses = await Address.find(q)
  } catch (e) {
    throw new Error(e)
  }
  const ids = addresses.map((a) => a.customerID)
  const customerIDs = ramda.uniq(ids).map((c) => mongoose.Types.ObjectId(c))

  const customers = await Customer.find({ _id: { $in: customerIDs } }).sort({ 'name.last': 1 })
  customers.forEach((c) => {
    c.address = ramda.find(ramda.propEq('customerID', c._id))(addresses) // eslint-disable-line no-param-reassign
  })
  return customers
}

const customerPersist = async ({ customerInput, addressInput }) => {
  let customerReturn

  try {
    if (customerInput && customerInput._id) {
      customerReturn = await Customer.findOneAndUpdate(
        { _id: customerInput._id },
        customerInput,
        { new: true },
      )
    } else {
      customerReturn = await Customer.create(customerInput)
    }
  } catch (e) {
    throw new Error(e)
  }
  if (addressInput) {
    const address = ramda.clone(addressInput)
    address.customerID = customerReturn._id
    try {
      if (address._id) {
        await Address.findOneAndUpdate({ _id: address._id }, address, { new: true })
      } else {
        await Address.create(address)
      }
    } catch (e) {
      await Customer.deleteOne({ _id: customerReturn._id })
      throw new Error(e)
    }
  }
  return customerReturn
}

const customerRemove = async (id) => {
  const q = {}
  const customerID = mongoose.Types.ObjectId(id)

  // start by checking for existing jobsheets
  let nSheets = null
  q.customerID = customerID
  try {
    nSheets = await JobSheet.countDocuments(q)
  } catch (e) {
    throw new Error(e)
  }
  if (nSheets) {
    throw new Error(`There are ${nSheets} Jobsheet(s) associated with this customer`)
  }

  // if customer has no sheets, start by deleting addresses
  try {
    await Address.deleteMany({ customerID: mongoose.Types.ObjectId(id) })
  } catch (e) {
    throw new Error(e)
  }

  let customerReturn
  try {
    customerReturn = await Customer.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return customerReturn
}

const customerPersistNotes = async ({ id, notes }) => {
  const customerID = mongoose.Types.ObjectId(id)

  try {
    const customerReturn = await Customer.findOneAndUpdate(
      { _id: customerID },
      { notes },
      { new: true },
    )
    return customerReturn
  } catch (e) {
    throw new Error(e)
  }
}

const customerToggleActive = async (id) => {
  const customerID = mongoose.Types.ObjectId(id)

  let customer
  try {
    customer = await Customer.findById(id, { active: 1 })
  } catch (e) {
    throw new Error(e)
  }

  try {
    const customerReturn = await Customer.findOneAndUpdate(
      { _id: customerID },
      { active: !customer.active },
      { new: true },
    )
    return customerReturn
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    customer: (_, { customerID }) => find(customerID),
    searchCustomer: (_, {
      active = true,
      field,
      value,
    }) => {
      if (field === 'address') {
        return searchByAddress({ value })
      }
      return searchByField({ field, value, active })
    },
  },
  Mutation: {
    customerPersist: (
      _, { customerInput, addressInput },
    ) => customerPersist({ customerInput, addressInput }),
    customerPersistNotes: (_, { id, notes }) => customerPersistNotes({ id, notes }),
    customerRemove: (_, { id }) => customerRemove(id),
    customerToggleActive: (_, { id }) => customerToggleActive(id),
  },
}
