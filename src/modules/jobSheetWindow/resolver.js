/* eslint-disable import/prefer-default-export */

import JobSheetWindow from './model'

const findOne = async (windowID) => {
  try {
    const other = await JobSheetWindow.findById(windowID).populate('productID')
    return other
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    jobSheetWindow: (_, { windowID }) => findOne(windowID),
  },
}
