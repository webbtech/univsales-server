export const customerID = '5b2122022aac043b0c7ec06d'
export const quoteID = '5cc7a74507651808c8d191c7'

export const newQuoteInput = {
  customerID,
  jobsheetID: '5ce69196ec2d8e7c1cb03dec',
}

export const quoteInput = {
  customerID,
  jobsheetID: '5ce69196ec2d8e7c1cb03dec',
  items: {
    group: ['5ce99fdd025e19724c914f0b', '5ced2100c7311400072f9ef3'],
    other: ['5ce9a0ec025e199639914f11', '5ced2120c7311400072f9ef6'],
    window: ['5ced4088312ca500078a292c'],
  },
  quotePrice: {
    outstanding: 0,
    payments: 0,
    subtotal: 5256.637168141593,
    tax: 683.3628318584069,
    total: 5940,
  },
  discount: {
    description: 'For doing whatever...',
    discount: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  },
  itemCosts: {
    group: 3860,
    other: 1500,
    subtotal: 5940,
    window: 580,
  },
}

export const discountInput = {
  _id: '',
  discount: {
    description: 'Discount for whatever reason',
    discount: 440,
    subtotal: 632.743362832,
    tax: 4867.256637168,
    total: 5500,
  },
  quotePrice: {
    outstanding: 5500,
    payments: 0,
    subtotal: 632.743362832,
    tax: 4867.256637168,
    total: 5500,
  },
}
