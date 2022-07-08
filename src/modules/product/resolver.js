/* eslint-disable import/prefer-default-export */

import Product from './model'

const productPersist = async (input) => {
  try {
    const ret = await Product.findOneAndUpdate(
      { _id: input._id },
      input,
      { new: true },
    )
    return ret
  } catch (e) {
    throw new Error(e)
  }
}

const findOne = async (productID) => {
  if (!productID) {
    throw new Error('Missing product id in product query')
  }
  try {
    const product = await Product.findById(productID)
    return product
  } catch (e) {
    throw new Error(e)
  }
}

const find = async () => {
  try {
    const items = await Product.find({}).sort({ name: 1 })
    return items
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Mutation: {
    productPersist: (_, { input }) => productPersist(input),
  },
  Query: {
    product: (_, { productID }) => findOne(productID),
    products: () => find(),
  },
}
