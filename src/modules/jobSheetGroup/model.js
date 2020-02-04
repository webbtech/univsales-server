/* eslint no-underscore-dangle: 0 */
const mongoose = require('mongoose')

const JobsheetWindowGroupItem = require('./groupItemModel')

const { Schema } = mongoose

const jobSheetGroupSchema = new Schema(
  {
    jobsheetID: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsheet',
    },
    costs: {
      discountAmount: { default: 0.00, type: Number },
      discounted: { default: 0.00, type: Number },
      extendTotal: { default: 0.00, type: Number },
      extendUnit: { default: 0.00, type: Number },
      install: { default: 0.00, type: Number },
      installType: { default: 0.00, type: Number },
      netUnit: { default: 0.00, type: Number },
      options: { default: 0.00, type: Number },
      trim: { default: 0.00, type: Number },
      windows: { default: 0.00, type: Number },
    },
    dims: {
      height: {
        decimal: Number,
        diff: { default: 0, type: Number },
        fraction: String,
        inch: { default: 0, type: Number },
      },
      width: {
        decimal: Number,
        diff: { default: 0, type: Number },
        fraction: String,
        inch: { default: 0, type: Number },
      },
    },
    items: [JobsheetWindowGroupItem.schema],
    qty: {
      type: Number,
      default: 1,
    },
    rooms: Array,
    specs: {
      groupTypeDescription: {
        type: String,
        required: true,
      },
      installType: String,
      options: String,
      sqft: Number,
      style: String,
      trim: String,
    },
  },
  {
    collection: 'jobsheet-win-grps',
    timestamps: true,
  },
)

const JobSheetGroup = mongoose.model('JobSheetGroup', jobSheetGroupSchema)

module.exports = JobSheetGroup
