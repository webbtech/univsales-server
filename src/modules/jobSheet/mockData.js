/* eslint-disable import/prefer-default-export */

const jobsheetID = '5b1846d52aac0450227ebfe9'

export const address = {
  associate: 'jobsheet',
  city: 'Welland',
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '47 Northgate Dr.',
  type: 'res',
  location: {
    type: 'Point',
    coordinates: [-79.2576469, 43.0095132],
  },
}

// Using Test Dummy customer id
export const jobsheet = {
  customerID: '5b2122022aac043b0c7ec06d',
}

export const features = 'A.C. Vinyl Windows (Darker)\nLow E & Argon Gas\nFull-frame Change 2 3/4" Fingerjoint Trim\nAluminum Capping\nComplete Garbage Removal\nInstalled Including HST'

export const groupInput = {
  jobsheetID,
  costs: {
    discountAmount: 0,
    discounted: 0,
    extendTotal: 1970,
    extendUnit: 1970,
    install: 775,
    installType: 0,
    netUnit: 1970,
    options: 0,
    trim: 0,
    windows: 1195,
  },
  dims: {
    height: {
      diff: 0,
      inch: 0,
      decimal: 0,
      fraction: '',
    },
    width: {
      diff: 0,
      inch: 0,
      decimal: 0,
      fraction: '',
    },
  },
  qty: 1,
  rooms: ['LR'],
  items: [
    {
      costs: {
        extendUnit: 350,
        extendTotal: 700,
      },
      dims: {
        height: {
          overSize: null,
          underSize: null,
          decimal: 52,
          fraction: '',
          inch: 52,
          round: 52,
        },
        width: {
          overSize: null,
          underSize: null,
          decimal: 19,
          fraction: '',
          inch: 19,
          round: 20,
        },
      },
      specs: {
        overSize: 0,
        extendSqft: 16,
        sqft: 8,
      },
      _id: '5cf52ea465acba0000d8e3e6',
      product: { name: 'Double Hung' },
      productID: '57855061982d822a04b760a2',
      qty: 2,
    },
    {
      costs: {
        extendUnit: 495,
        extendTotal: 495,
      },
      dims: {
        height: {
          overSize: null,
          underSize: null,
          decimal: 52,
          fraction: '',
          inch: 52,
          round: 52,
        },
        width: {
          overSize: null,
          underSize: null,
          decimal: 50.875,
          fraction: '7/8',
          inch: 50,
          round: 52,
        },
      },
      specs: {
        overSize: 7,
        extendSqft: 19,
        sqft: 19,
      },
      _id: '5cf52eb865acba0000d8e3e7',
      product: { name: 'Fixed' },
      productID: '57855061982d822a04b760a4',
      qty: 1,
    },
  ],
  specs: {
    groupTypeDescription: '2 Double Hungs- 1 Fixed ',
    installType: 'Regular Replacement',
    options: 'White: Low E & Argon Gas (dark)\n1/2 Screens',
    sqft: 35,
    style: '',
    trim: 'Aluminum Capping',
  },
}

export const otherInput = {
  jobsheetID,
  rooms: ['BR'],
  costs: {
    extendUnit: 825,
    extendTotal: 825,
  },
  description: 'Installation of Single S/L Door\nIncludes Aluminum Capping',
  qty: 1,
  specs: {
    location: '',
    options: '',
  },
}

export const windowInput = {
  jobsheetID,
  costs: {
    discounted: 0,
    extendTotal: 905,
    extendUnit: 905,
    install: 435,
    installType: 0,
    netUnit: 905,
    options: 0,
    trim: 0,
    window: 470,
  },
  dims: {
    height: {
      decimal: 53.25,
      fraction: '1/4',
      inch: 53,
      overSize: null,
      round: 54,
      underSize: null,
    },
    width: {
      decimal: 38.875,
      fraction: '7/8',
      inch: 38,
      overSize: null,
      round: 40,
      underSize: null,
    },
  },
  specs: {
    installType: 'Regular Replacement',
    options: 'White: Low E & Argon Gas (dark)\n1/2 Screens',
    overSize: 3,
    sqft: 15,
    trim: 'Aluminum Capping',
  },
  rooms: ['HW'],
  productID: '57855061982d822a04b760a2',
  qty: 1,
}
