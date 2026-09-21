// Temporary data. Replace with your API / storage layer later.

export const user = {
  firstName: 'Saint Mark',
};

export const trips = [
  {
    id: 'boracay',
    destination: 'Boracay Island',
    startDate: '2026-09-19',
    endDate: '2026-09-25',
    status: 'planned',
    activitiesCount: 4,
    // Drop a photo in assets/images and use: require('../../assets/images/boracay.jpg')
    image: null,
  },
];

export const packingLists = [
  {
    id: 'boracay-packing',
    title: 'Boracay Island',
    startDate: '2026-09-19',
    endDate: '2026-09-23',
    packed: 6,
    total: 14,
  },
];

export const weather = {
  temperature: 35,
  location: 'Calbayog City, Philippines',
};
