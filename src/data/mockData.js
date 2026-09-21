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

// One entry = one time block on one day (a day can have several blocks).
export const itinerary = [
  {
    id: 'boracay-d1-morning',
    tripId: 'boracay',
    date: '2026-09-19',
    time: '8:30 AM',
    location: 'Boracay Island, Malay, Aklan',
    activities: [
      { id: 'a1', title: 'Arrive at Boracay', done: true },
      { id: 'a2', title: 'Check-in at Resort', done: false },
      { id: 'a3', title: 'Get Lunch', done: false },
      { id: 'a4', title: 'Island Hoping', done: false },
      { id: 'a5', title: 'Sunset Viewing', done: false },
      { id: 'a6', title: 'Dinner', done: false },
      { id: 'a7', title: 'Get Rest', done: false },
    ],
  },
  {
    id: 'boracay-d1-second',
    tripId: 'boracay',
    date: '2026-09-19',
    time: '7:30 PM',
    location: 'Boracay Island, Malay, Aklan',
    // Placeholder items: replace with your real ones.
    activities: [
      { id: 'b1', title: 'Beach Walk', done: false },
      { id: 'b2', title: 'Night Market', done: false },
    ],
  },
];