import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Shared app data. Everything starts empty and is filled in by the user, so a screen can
// add a trip and every other screen sees it.
const TripsContext = createContext(null);

// Packing items without a category go under this heading
export const DEFAULT_CATEGORY = 'Essentials';

// Unique id, even if two things are created in the same millisecond
const uniqueId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function TripsProvider({ children }) {
  const [rawTrips, setTrips] = useState([]);
  const [rawPackingLists, setPackingLists] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [doneDatesByTrip, setDoneDatesByTrip] = useState({}); // { tripId: ['2026-09-19', ...] }
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Packed / total are always calculated from the items, so Home and Packing never disagree
  const packingLists = useMemo(
    () =>
      rawPackingLists.map((list) =>
        list.items
          ? {
              ...list,
              packed: list.items.filter((item) => item.packed).length,
              total: list.items.length,
            }
          : list
      ),
    [rawPackingLists]
  );

    // The activity count is always calculated from the itinerary, so Home never shows a stale number
  const trips = useMemo(
    () =>
      rawTrips.map((trip) => ({
        ...trip,
        activitiesCount: itinerary
          .filter((entry) => entry.tripId === trip.id)
          .reduce((count, entry) => count + entry.activities.length, 0),
      })),
    [rawTrips, itinerary]
  );

  // The trip the Itinerary screen and Packing screen show
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? trips[0] ?? null;

  const selectTrip = useCallback((tripId) => setSelectedTripId(tripId), []);

  // form = { destination, location, startDate, endDate, packingItems[], activities[], activityTime }
  const addTrip = useCallback((form) => {
    const { destination, location, startDate, endDate, packingItems, activities, activityTime } = form;
    const id = uniqueId(slugify(destination) || 'trip');

    // A trip
    const trip = {
      id,
      destination,
      startDate,
      endDate,
      status: 'planned',
      activitiesCount: activities.length,
      image: null,
    };
    // Keep trips ordered by start date ('2026-09-19' strings sort correctly)
    setTrips((current) => [...current, trip].sort((a, b) => a.startDate.localeCompare(b.startDate)));

    // A packing list: the things to bring, all unpacked to start with
    if (packingItems.length > 0) {
      setPackingLists((current) => [
        ...current,
        {
          id: `${id}-packing`,
          tripId: id,
          title: destination,
          startDate,
          endDate,
          packed: 0,
          total: packingItems.length,
          items: packingItems.map((title, index) => ({
            id: `${id}-p${index + 1}`,
            title,
            packed: false,
            category: DEFAULT_CATEGORY,
          })),
        },
      ]);
    }

    // Itinerary: one block on the first day
    if (activities.length > 0) {
      setItinerary((current) => [
        ...current,
        {
          id: `${id}-day1`,
          tripId: id,
          date: startDate,
          time: activityTime,
          location: location || destination,
          activities: activities.map((title, index) => ({
            id: `${id}-a${index + 1}`,
            title,
            done: false,
          })),
        },
      ]);
    }

    setSelectedTripId(id);
    return id;
  }, []);

  const toggleActivity = useCallback((entryId, activityId) => {
    setItinerary((current) =>
      current.map((entry) =>
        entry.id !== entryId
          ? entry
          : {
              ...entry,
              activities: entry.activities.map((activity) =>
                activity.id === activityId ? { ...activity, done: !activity.done } : activity
              ),
            }
      )
    );
  }, []);

  const deleteEntry = useCallback((entryId) => {
    setItinerary((current) => current.filter((entry) => entry.id !== entryId));
  }, []);

    // Edits an entry's time, location and activities (changes = { time, location, activities[] }).
  // An activity whose title is unchanged keeps its done tick; a new title starts not done.
  const updateEntry = useCallback((entryId, changes) => {
    const { time, location, activities } = changes;
    setItinerary((current) =>
      current.map((entry) => {
        if (entry.id !== entryId) return entry;

        const nextActivities = activities.map((title) => {
          const existing = entry.activities.find(
            (activity) => activity.title.toLowerCase() === title.toLowerCase()
          );
          return existing
            ? { ...existing, title }
            : { id: uniqueId(`${entry.id}-a`), title, done: false };
        });

        return { ...entry, time, location, activities: nextActivities };
      })
    );
  }, []);

  
  const togglePacked = useCallback((listId, itemId) => {
    setPackingLists((current) =>
      current.map((list) =>
        list.id !== listId
          ? list
          : {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
      )
    );
  }, []);

  const deletePackingItem = useCallback((listId, itemId) => {
    setPackingLists((current) =>
      current.map((list) =>
        list.id !== listId
          ? list
          : { ...list, items: list.items.filter((item) => item.id !== itemId) }
      )
    );
  }, []);

  // Renames an item. An empty name is ignored so an item can never end up blank.
  const renamePackingItem = useCallback((listId, itemId, title) => {
    const name = title.trim();
    if (!name) return;
    setPackingLists((current) =>
      current.map((list) =>
        list.id !== listId
          ? list
          : {
              ...list,
              items: list.items.map((item) => (item.id === itemId ? { ...item, title: name } : item)),
            }
      )
    );
  }, []);

  // Adds an unpacked item. If the trip has no packing list yet, one is created for it.
  const addPackingItem = useCallback(
    (tripId, title, category = DEFAULT_CATEGORY) => {
      const trip = trips.find((entry) => entry.id === tripId);
      const item = {
        id: uniqueId(`${tripId}-p`),
        title,
        packed: false,
        category,
      };

      setPackingLists((current) => {
        if (current.some((list) => list.tripId === tripId)) {
          return current.map((list) =>
            list.tripId !== tripId ? list : { ...list, items: [...(list.items ?? []), item] }
          );
        }
        if (!trip) return current;
        return [
          ...current,
          {
            id: `${tripId}-packing`,
            tripId,
            title: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            packed: 0,
            total: 0,
            items: [item],
          },
        ];
      });
    },
    [trips]
  );

  const toggleDayDone = useCallback((tripId, date) => {
    setDoneDatesByTrip((current) => {
      const dates = current[tripId] ?? [];
      return {
        ...current,
        [tripId]: dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date],
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      trips,
      packingLists,
      itinerary,
      doneDatesByTrip,
      selectedTrip,
      selectTrip,
      addTrip,
      toggleActivity,
      deleteEntry,
      updateEntry,
      toggleDayDone,
      togglePacked,
      deletePackingItem,
      renamePackingItem,
      addPackingItem,
    }),
    [
      trips,
      packingLists,
      itinerary,
      doneDatesByTrip,
      selectedTrip,
      selectTrip,
      addTrip,
      toggleActivity,
      deleteEntry,
      updateEntry,
      toggleDayDone,
      togglePacked,
      deletePackingItem,
      renamePackingItem,
      addPackingItem,
    ]
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) throw new Error('useTrips must be used inside <TripsProvider>');
  return context;
}