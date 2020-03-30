const mongoose = require('mongoose')

const { Schema } = mongoose

const jobSheetWindowSchema = new Schema(
  {
    jobsheetID: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsheet',
      required: true,
    },
    productID: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    costs: {
      discountAmount: { default: null, type: Number },
      discounted: { default: 0.00, type: Number },
      extendTotal: { default: null, type: Number },
      extendUnit: { default: null, type: Number },
      install: { default: 0.00, type: Number },
      installType: { default: 0.00, type: Number },
      netUnit: { default: 0.00, type: Number },
      options: { default: 0.00, type: Number },
      trim: { default: 0.00, type: Number },
      window: { default: 0.00, type: Number },
    },
    dims: {
      height: {
        decimal: Number,
        fraction: String,
        inch: { required: true, type: Number },
        overSize: { default: null, type: Number },
        round: Number,
        underSize: { default: null, type: Number },
      },
      width: {
        decimal: Number,
        fraction: String,
        inch: { required: true, type: Number },
        overSize: { default: null, type: Number },
        round: Number,
        underSize: { default: null, type: Number },
      },
    },
    qty: {
      required: true,
      type: Number,
    },
    rooms: Array,
    specs: {
      installType: String,
      options: String,
      optionsDoc: Object,
      overSize: { default: null, type: Number },
      sqft: Number,
      trim: String,
    },
  },
  {
    collection: 'jobsheet-wins',
    timestamps: true,
  },
)

const JobSheetWindow = mongoose.model('JobSheetWindow', jobSheetWindowSchema)

module.exports = JobSheetWindow
