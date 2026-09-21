import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  itinerary as initialItinerary,
  packingLists as initialPackingLists,
  trips as initialTrips,
} from '../data/mockData';

// Shared app data. mockData.js is the STARTING data; this file holds the live copy
// so a screen can add a trip and every other screen sees it.
const TripsContext = createContext(null);

// Packing items without a category go under this heading
export const DEFAULT_CATEGORY = 'Essentials';

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState(initialTrips);
  const [rawPackingLists, setPackingLists] = useState(initialPackingLists);
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [doneDatesByTrip, setDoneDatesByTrip] = useState({}); // { tripId: ['2026-09-19', ...] }
  const [selectedTripId, setSelectedTripId] = useState(initialTrips[0]?.id ?? null);

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

  // The trip the Itinerary screen and Packing screen show
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? trips[0] ?? null;

  const selectTrip = useCallback((tripId) => setSelectedTripId(tripId), []);

  // form = { destination, location, startDate, endDate, packingItems[], activities[], activityTime }
  const addTrip = useCallback((form) => {
    const { destination, location, startDate, endDate, packingItems, activities, activityTime } = form;
    const id = `${slugify(destination) || 'trip'}-${Date.now()}`;

    // Same shape as an entry in mockData.trips
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

    // Same shape as mockData.packingLists, plus an `items` list of what to bring
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

    // Same shape as mockData.itinerary: one block on the first day
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

  // Adds an unpacked item. If the trip has no packing list yet, one is created for it.
  const addPackingItem = useCallback(
    (tripId, title, category = DEFAULT_CATEGORY) => {
      const trip = trips.find((entry) => entry.id === tripId);
      const item = {
        id: `${tripId}-p${Date.now()}`,
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
      toggleDayDone,
      togglePacked,
      deletePackingItem,
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
      toggleDayDone,
      togglePacked,
      deletePackingItem,
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