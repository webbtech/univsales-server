/* eslint-disable import/prefer-default-export */

import JobSheetOther from './model'

const findOne = async (otherID) => {
  try {
    const window = await JobSheetOther.findById(otherID)
    return window
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    jobSheetOther: (_, { otherID }) => findOne(otherID),
  },
}
