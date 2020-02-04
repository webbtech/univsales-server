/* eslint-disable import/prefer-default-export */

import Product from './model'

const find = async () => {
  try {
    const items = await Product.find({}).sort({ name: 1 })
    return items
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    products: () => find(),
  },
}
