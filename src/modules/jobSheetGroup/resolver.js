/* eslint-disable import/prefer-default-export */

import JobSheetGroup from './model'

const findOne = async (groupID) => {
  try {
    const group = await JobSheetGroup.findById(groupID)
    return group
  } catch (e) {
    throw new Error(e)
  }
}

export const resolvers = {
  Query: {
    jobSheetGroup: (_, { groupID }) => findOne(groupID),
  },
}
