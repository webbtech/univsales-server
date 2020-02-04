export const customerID = '5b2122022aac043b0c7ec06d'

export const addressNew = {
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '47 Northgate Dr.',
  street2: null,
  type: 'res',
  location: {
    type: 'Point',
    coordinates: [-79.2576469, 43.0095132],
  },
}

export const addressUpdate = {
  _id: '5b2122022aac0404227ec06c',
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '456 Street Ave..',
  street2: null,
  type: 'res',
  location: {
    type: 'Point',
    coordinates: [ -79.248093, 42.985164 ]
  }
}

export const customerNew = {
  // active: true,
  email: 'test2@webbtech.net',
  name: {
    first: 'Test ',
    last: 'Dummy',
    spouse: 'Kimberly',
  },
  phones: [
    {
      _id: 'home',
      countryCode: '1',
      number: '(905) 687-0000',
    },
    {
      _id: 'mobile',
      countryCode: '1',
      number: '(905) 984-9000',
    },
  ],
}

export const customerUpdate = {
  _id: '',
  email: 'update@webbtech.net',
  name: {
    first: 'Test',
    last: 'Dummy',
    spouse: 'Kimberly',
  },
  phones: [
    {
      _id: 'home',
      countryCode: '1',
      number: '(905) 687-0000',
    },
    {
      _id: 'mobile',
      countryCode: '1',
      number: '(905) 984-9000',
    },
  ],
}

export const persistNotesVars = {
  id: customerID,
  notes: 'Some dump test notes here',
}
