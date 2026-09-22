export const packingLists = [
  {
    id: 'boracay-packing',
    tripId: 'boracay',
    title: 'Boracay Island',
    startDate: '2026-09-19',
    endDate: '2026-09-23',
    // packed / total are recalculated from `items` while the app runs
    packed: 6,
    total: 11,
    items: [
      { id: 'p1', title: 'Shirts', packed: true, category: 'Essentials' },
      { id: 'p2', title: 'Shorts', packed: true, category: 'Essentials' },
      { id: 'p3', title: 'Pants', packed: true, category: 'Essentials' },
      { id: 'p4', title: 'Charger & Power Bank', packed: true, category: 'Essentials' },
      { id: 'p5', title: 'Water Bottle', packed: true, category: 'Essentials' },
      { id: 'p6', title: 'Airpods', packed: true, category: 'Essentials' },
      { id: 'p7', title: 'Socks', packed: false, category: 'Essentials' },
      { id: 'p8', title: 'Underwear', packed: false, category: 'Essentials' },
      { id: 'p9', title: 'Documents', packed: false, category: 'Essentials' },
      { id: 'p10', title: 'Medicine', packed: false, category: 'Essentials' },
      { id: 'p11', title: 'Toiletries', packed: false, category: 'Essentials' },
    ],
  },
];