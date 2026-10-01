import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeState, emptyState, selectedTripOf, tripStatus, uniqueId } from '../state/trips';
import { createTripStorage } from '../state/storage';
import { toIsoDate } from '../utils/date';
import useNow from '../hooks/useNow';
export { DEFAULT_CATEGORY } from '../state/trips';
const TripsContext = createContext(null);

export function TripsProvider({ children }) {
  const [state, setState] = useState(emptyState);
  const stateRef = useRef(state);
  const [storage] = useState(() => createTripStorage(AsyncStorage));
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const revision = useRef(0);
  const insets = useSafeAreaInsets();
  const now = useNow();
  const today = toIsoDate(now);

  const load = useCallback(() => {
    return storage
      .load()
      .then((saved) => {
        stateRef.current = saved;
        setState(saved);
        setReady(true);
      })
      .catch((error) => {
        setLoadError(error.message || 'Could not read saved trips.');
      });
  }, [storage]);
  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    (snapshot) => {
      const currentRevision = ++revision.current;
      setSaving(true);
      storage
        .save(snapshot)
        .then(() => {
          if (revision.current === currentRevision) {
            setSaving(false);
            setSaveError(false);
          }
        })
        .catch(() => {
          if (revision.current === currentRevision) {
            setSaving(false);
            setSaveError(true);
          }
        });
    },
    [storage]
  );
  const commit = useCallback(
    (action) => {
      if (!ready) throw new Error('Please wait for your saved trips to load.');
      const next = changeState(stateRef.current, action);
      if (next === stateRef.current) return;
      stateRef.current = next;
      setState(next);
      persist(next);
    },
    [ready, persist]
  );
  const actions = useMemo(
    () => ({
      selectTrip: (id) => commit({ type: 'select', id }),
      addTrip: (form) => {
        const id = uniqueId();
        commit({ type: 'addTrip', id, form });
        return id;
      },
      updateTrip: (id, form) => commit({ type: 'updateTrip', id, form }),
      deleteTrip: (id) => commit({ type: 'deleteTrip', id }),
      addEntry: (tripId, form) => commit({ type: 'addEntry', id: uniqueId(), tripId, form }),
      updateEntry: (id, form) =>
        commit({ type: 'updateEntry', id, form, activitySeed: uniqueId() }),
      deleteEntry: (id) => commit({ type: 'deleteEntry', id }),
      toggleActivity: (id, activityId) => commit({ type: 'toggleActivity', id, activityId }),
      toggleDayDone: (id, date) => commit({ type: 'toggleDay', id, date }),
      addPackingItem: (tripId, title, category) =>
        commit({ type: 'addPacking', id: uniqueId(), tripId, title, category }),
      togglePacked: (id, itemId) => commit({ type: 'togglePacked', id, itemId }),
      deletePackingItem: (id, itemId) => commit({ type: 'deletePacking', id, itemId }),
      renamePackingItem: (id, itemId, title) =>
        commit({ type: 'renamePacking', id, itemId, title }),
      updateNotes: (id, notes) => commit({ type: 'notes', id, notes }),
      updateProfile: (firstName) => commit({ type: 'profile', firstName }),
    }),
    [commit]
  );
  const trips = useMemo(
    () =>
      state.trips.map((trip) => ({
        ...trip,
        status: tripStatus(trip, today),
        activitiesCount: state.itinerary
          .filter((e) => e.tripId === trip.id)
          .reduce((n, e) => n + e.activities.length, 0),
      })),
    [state.trips, state.itinerary, today]
  );
  const packingLists = useMemo(
    () =>
      state.packingLists.map((list) => {
        const trip = state.trips.find((t) => t.id === list.tripId);
        return {
          ...list,
          title: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          packed: list.items.filter((i) => i.packed).length,
          total: list.items.length,
        };
      }),
    [state.packingLists, state.trips]
  );
  const selectedTrip = selectedTripOf({ ...state, trips });
  const value = { ...state, ...actions, trips, packingLists, selectedTrip, now, saving, saveError };
  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'white' }}>
        {loadError ? (
          <>
            <Text accessibilityRole="alert">
              Your saved trips could not be opened. They have not been overwritten. {loadError}
            </Text>
            <Pressable
              onPress={() => {
                setLoadError('');
                load();
              }}
              accessibilityRole="button"
              style={{ padding: 16 }}
            >
              <Text>Retry loading</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator />
            <Text style={{ textAlign: 'center', marginTop: 12 }}>Loading your trips...</Text>
          </>
        )}
      </View>
    );
  return (
    <TripsContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {saveError ? (
          <View
            style={{
              paddingTop: insets.top + 8,
              paddingHorizontal: 20,
              backgroundColor: '#FFF0DC',
            }}
          >
            <Text accessibilityRole="alert">
              Changes could not be saved on this device. Keep the app open and retry.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => persist(stateRef.current)}
              style={{ paddingVertical: 12 }}
            >
              <Text>Retry saving</Text>
            </Pressable>
          </View>
        ) : null}
        {children}
      </View>
    </TripsContext.Provider>
  );
}
export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) throw new Error('useTrips must be used inside TripsProvider');
  return context;
}
