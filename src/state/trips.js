import { isValidIsoDate, parseTimeLabel } from '../utils/date.js';

export const DEFAULT_CATEGORY = 'Essentials';
export const emptyState = () => ({
  trips: [],
  packingLists: [],
  itinerary: [],
  doneDatesByTrip: {},
  selectedTripId: null,
  profile: { firstName: '' },
});
export const uniqueId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};
const titles = (values = []) => [
  ...new Map(values.filter(text).map((v) => [v.trim().toLowerCase(), v.trim()])).values(),
];
const inTrip = (date, trip) =>
  isValidIsoDate(date) && date >= trip.startDate && date <= trip.endDate;
export function validateTrip(form) {
  requireValue(text(form.destination), 'Enter a destination.');
  requireValue(
    isValidIsoDate(form.startDate) && isValidIsoDate(form.endDate),
    'Choose valid trip dates.'
  );
  requireValue(form.startDate <= form.endDate, 'End date must be on or after the start date.');
}
export function validateEntry(form, trip) {
  requireValue(trip && inTrip(form.date, trip), 'Choose a plan date within the trip dates.');
  requireValue(parseTimeLabel(form.time), 'Choose a valid time.');
  requireValue(
    Array.isArray(form.activities) && titles(form.activities).length,
    'Add at least one activity.'
  );
}
export const tripStatus = (trip, today) =>
  trip.endDate < today ? 'completed' : trip.startDate > today ? 'planned' : 'ongoing';
export const selectedTripOf = (state) =>
  state.trips.find((t) => t.id === state.selectedTripId) ?? state.trips[0] ?? null;
export const timeMinutes = (label) => {
  const d = parseTimeLabel(label);
  return d ? d.getHours() * 60 + d.getMinutes() : 0;
};
export const sortEntries = (entries) =>
  [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || timeMinutes(a.time) - timeMinutes(b.time)
  );
const activitiesFor = (values, id, old = []) =>
  titles(values).map((title, i) => {
    const existing = old.find((a) => a.title.toLowerCase() === title.toLowerCase());
    return existing ? { ...existing, title } : { id: `${id}-a${i}`, title, done: false };
  });
function cleanDoneDates(state) {
  return {
    ...state,
    doneDatesByTrip: Object.fromEntries(
      state.trips.map((trip) => [
        trip.id,
        (state.doneDatesByTrip[trip.id] ?? []).filter((date) =>
          state.itinerary.some((e) => e.tripId === trip.id && e.date === date)
        ),
      ])
    ),
  };
}
export function changeState(state, action) {
  const { type, id, form } = action;
  switch (type) {
    case 'select':
      return state.trips.some((t) => t.id === id) ? { ...state, selectedTripId: id } : state;
    case 'addTrip': {
      validateTrip(form);
      const trip = {
        id,
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        notes: '',
        image: null,
      };
      let next = {
        ...state,
        trips: [...state.trips, trip].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        selectedTripId: id,
      };
      const packing = titles(form.packingItems);
      if (packing.length)
        next.packingLists = [
          ...next.packingLists,
          {
            id: `${id}-packing`,
            tripId: id,
            items: packing.map((title, i) => ({
              id: `${id}-p${i}`,
              title,
              packed: false,
              category: DEFAULT_CATEGORY,
            })),
          },
        ];
      if (titles(form.activities).length)
        next = changeState(next, {
          type: 'addEntry',
          id: `${id}-first`,
          tripId: id,
          form: {
            date: form.startDate,
            time: form.activityTime,
            location: form.location,
            activities: form.activities,
          },
        });
      return next;
    }
    case 'updateTrip': {
      validateTrip(form);
      const trip = state.trips.find((t) => t.id === id);
      requireValue(trip, 'This trip no longer exists.');
      const outside = state.itinerary.find((e) => e.tripId === id && !inTrip(e.date, form));
      requireValue(
        !outside,
        `A plan on ${outside?.date} falls outside these dates. Move or delete that plan first.`
      );
      return {
        ...state,
        trips: state.trips
          .map((t) =>
            t.id === id
              ? {
                  ...t,
                  destination: form.destination.trim(),
                  startDate: form.startDate,
                  endDate: form.endDate,
                }
              : t
          )
          .sort((a, b) => a.startDate.localeCompare(b.startDate)),
      };
    }
    case 'deleteTrip': {
      const trips = state.trips.filter((t) => t.id !== id);
      return cleanDoneDates({
        ...state,
        trips,
        selectedTripId: state.selectedTripId === id ? (trips[0]?.id ?? null) : state.selectedTripId,
        packingLists: state.packingLists.filter((l) => l.tripId !== id),
        itinerary: state.itinerary.filter((e) => e.tripId !== id),
      });
    }
    case 'addEntry':
    case 'updateEntry': {
      const old = state.itinerary.find((e) => e.id === id);
      const tripId = type === 'addEntry' ? action.tripId : old?.tripId;
      const trip = state.trips.find((t) => t.id === tripId);
      validateEntry(form, trip);
      const entry = {
        id,
        tripId,
        date: form.date,
        time: form.time,
        location: form.location?.trim() || trip.destination,
        activities: activitiesFor(form.activities, action.activitySeed ?? id, old?.activities),
      };
      const itinerary =
        type === 'addEntry'
          ? [...state.itinerary, entry]
          : state.itinerary.map((e) => (e.id === id ? entry : e));
      // A changed plan needs a fresh review before the day is marked complete again.
      const dates = state.doneDatesByTrip[tripId] ?? [];
      return cleanDoneDates({
        ...state,
        itinerary: sortEntries(itinerary),
        doneDatesByTrip: {
          ...state.doneDatesByTrip,
          [tripId]: dates.filter((d) => d !== entry.date && d !== old?.date),
        },
      });
    }
    case 'deleteEntry':
      return cleanDoneDates({ ...state, itinerary: state.itinerary.filter((e) => e.id !== id) });
    case 'toggleActivity':
      return {
        ...state,
        itinerary: state.itinerary.map((e) =>
          e.id === id
            ? {
                ...e,
                activities: e.activities.map((a) =>
                  a.id === action.activityId ? { ...a, done: !a.done } : a
                ),
              }
            : e
        ),
      };
    case 'toggleDay': {
      if (!state.itinerary.some((e) => e.tripId === id && e.date === action.date)) return state;
      const dates = state.doneDatesByTrip[id] ?? [];
      return {
        ...state,
        doneDatesByTrip: {
          ...state.doneDatesByTrip,
          [id]: dates.includes(action.date)
            ? dates.filter((d) => d !== action.date)
            : [...dates, action.date],
        },
      };
    }
    case 'addPacking': {
      if (!text(action.title) || !state.trips.some((t) => t.id === action.tripId)) return state;
      const item = {
        id,
        title: action.title.trim(),
        packed: false,
        category: action.category?.trim() || DEFAULT_CATEGORY,
      };
      const list = state.packingLists.find((l) => l.tripId === action.tripId);
      return {
        ...state,
        packingLists: list
          ? state.packingLists.map((l) =>
              l.id === list.id ? { ...l, items: [...l.items, item] } : l
            )
          : [
              ...state.packingLists,
              { id: `${action.tripId}-packing`, tripId: action.tripId, items: [item] },
            ],
      };
    }
    case 'togglePacked':
    case 'deletePacking':
    case 'renamePacking':
      return {
        ...state,
        packingLists: state.packingLists.map((l) =>
          l.id !== id
            ? l
            : {
                ...l,
                items:
                  type === 'deletePacking'
                    ? l.items.filter((i) => i.id !== action.itemId)
                    : l.items.map((i) =>
                        i.id !== action.itemId
                          ? i
                          : type === 'togglePacked'
                            ? { ...i, packed: !i.packed }
                            : { ...i, title: action.title.trim() || i.title }
                      ),
              }
        ),
      };
    case 'notes':
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === id ? { ...t, notes: action.notes } : t)),
      };
    case 'profile':
      return { ...state, profile: { firstName: action.firstName } };
    default:
      return state;
  }
}

// Reject damaged/unknown snapshots instead of silently replacing a user's saved trips.
export function decodeState(raw) {
  if (raw === null) return emptyState();
  const snapshot = JSON.parse(raw);
  requireValue(snapshot.version === 1, 'This saved data uses an unsupported version.');
  const s = snapshot.data;
  requireValue(
    s && Array.isArray(s.trips) && Array.isArray(s.packingLists) && Array.isArray(s.itinerary),
    'Saved trip data is invalid.'
  );
  const ids = new Set();
  const checkId = (id) => {
    requireValue(text(id) && !ids.has(id), 'Saved data has invalid or duplicate IDs.');
    ids.add(id);
  };
  for (const t of s.trips) {
    checkId(t.id);
    validateTrip(t);
    requireValue(typeof t.notes === 'string', 'Saved notes are invalid.');
  }
  for (const e of s.itinerary) {
    checkId(e.id);
    requireValue(
      Array.isArray(e.activities) && typeof e.location === 'string',
      'Saved plan is invalid.'
    );
    validateEntry(
      { ...e, activities: e.activities.map((a) => a.title) },
      s.trips.find((t) => t.id === e.tripId)
    );
    for (const a of e.activities) {
      checkId(a.id);
      requireValue(text(a.title) && typeof a.done === 'boolean', 'Saved activity is invalid.');
    }
  }
  const listTrips = new Set();
  for (const l of s.packingLists) {
    checkId(l.id);
    requireValue(
      s.trips.some((t) => t.id === l.tripId) && !listTrips.has(l.tripId) && Array.isArray(l.items),
      'Saved packing list is invalid.'
    );
    listTrips.add(l.tripId);
    for (const i of l.items) {
      checkId(i.id);
      requireValue(
        text(i.title) && typeof i.packed === 'boolean' && text(i.category),
        'Saved packing item is invalid.'
      );
    }
  }
  requireValue(s.profile && typeof s.profile.firstName === 'string', 'Saved profile is invalid.');
  requireValue(
    s.doneDatesByTrip && typeof s.doneDatesByTrip === 'object' && !Array.isArray(s.doneDatesByTrip),
    'Saved progress is invalid.'
  );
  for (const dates of Object.values(s.doneDatesByTrip))
    requireValue(
      Array.isArray(dates) && dates.every(isValidIsoDate),
      'Saved progress dates are invalid.'
    );
  requireValue(
    s.selectedTripId === null || typeof s.selectedTripId === 'string',
    'Saved selection is invalid.'
  );
  return cleanDoneDates({
    ...s,
    trips: [...s.trips].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    itinerary: sortEntries(s.itinerary),
  });
}
export const encodeState = (state) => JSON.stringify({ version: 1, data: state });
