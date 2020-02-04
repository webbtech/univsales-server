import mongoose from 'mongoose'

import Address from './model'


const findOne = async (args) => {
  const q = {}

  if (!args.associate) {
    throw new Error('Missing associate value in address query')
  }
  q.associate = args.associate
  if (!args.associateID) {
    throw new Error('Missing associate id value in address query')
  }
  q.customerID = mongoose.Types.ObjectId(sanz(args.associateID))

  let address
  try {
    address = Address.findOne(q)
  } catch (e) {
    throw new Error(e)
  }
  return address
}

export const resolvers = {
  Query: {
    // address: (_, { customerID }) => findOne(customerID),
  },
}
