import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EmptyState, Pill, ProgressBar } from '../components/common';
import TripSelector from '../components/common/TripSelector';
import {
  DayHeader,
  EditEntryModal,
  ItineraryCard,
  ItineraryHeader,
  ItineraryMap,
  SegmentTabs,
} from '../components/itinerary';
import NewTripModal from '../components/home/NewTripModal';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { useTrips } from '../context/TripsContext';
import { formatFullDate, formatLongRange, getDayLabel } from '../utils/date';
import { confirmDelete } from '../utils/confirm';
const TABS = ['Itinerary', 'Map', 'Notes'];
const STATUS_LABELS = { planned: 'Planned', ongoing: 'Ongoing', completed: 'Completed' };

export default function ItineraryScreen() {
  const { selectedTrip } = useTrips();
  return <TripItinerary key={selectedTrip?.id ?? 'empty'} />;
}
function TripItinerary() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    selectedTrip: trip,
    itinerary,
    doneDatesByTrip,
    toggleActivity,
    toggleDayDone,
    deleteEntry,
    updateEntry,
    addEntry,
    updateTrip,
    deleteTrip,
    updateNotes,
    saving,
    saveError,
  } = useTrips();
  const [activeTab, setActiveTab] = useState('Itinerary');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingTrip, setEditingTrip] = useState(false);
  if (!trip)
    return (
      <View className="flex-1 justify-center bg-white" style={{ padding: SCREEN_PADDING }}>
        <EmptyState
          title="No trips yet"
          message="Create a trip from Home to start planning."
          actionLabel="Go to Home"
          onActionPress={() => navigation.navigate('Home')}
        />
      </View>
    );
  const entries = itinerary.filter((e) => e.tripId === trip.id);
  const dates = [...new Set(entries.map((e) => e.date))];
  const doneDates = doneDatesByTrip[trip.id] ?? [];
  const doneDays = dates.filter((date) => doneDates.includes(date)).length;
  const saveEntry = (id, form) => {
    if (id) updateEntry(id, form);
    else addEntry(trip.id, form);
    setEditingEntry(null);
  };
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >
        <ItineraryHeader
          title="Itinerary"
          dateLabel={trip.destination}
          onBackPress={() => navigation.navigate('Home')}
        />
        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <TripSelector />
          <AppText variant="heading">{trip.destination}</AppText>
          <AppText variant="muted" className="mt-1">
            {formatLongRange(trip.startDate, trip.endDate)}
          </AppText>
          <View className="my-4 flex-row flex-wrap gap-3">
            <Pill label={STATUS_LABELS[trip.status]} tone="brand" />
            <Pill label="Edit trip" onPress={() => setEditingTrip(true)} />
            <Pill
              label="Delete trip"
              onPress={() =>
                confirmDelete(
                  'Delete this trip?',
                  `Remove ${trip.destination}, its plans, notes, and packing list from this device?`,
                  () => deleteTrip(trip.id)
                )
              }
            />
          </View>
          <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'Map' ? (
            <ItineraryMap trip={trip} entries={entries} />
          ) : activeTab === 'Notes' ? (
            <View className="mt-5">
              <AppText variant="subheading">Trip notes</AppText>
              <TextInput
                accessibilityLabel="Trip notes"
                multiline
                textAlignVertical="top"
                value={trip.notes}
                onChangeText={(notes) => updateNotes(trip.id, notes)}
                placeholder="Addresses, reminders, and ideas for this trip..."
                className="mt-3 min-h-[220px] rounded-2xl border border-gray-200 p-4 font-sans text-base text-ink"
              />
              <AppText variant="caption" className="mt-2">
                {saveError
                  ? 'Not saved. Use Retry saving above.'
                  : saving
                    ? 'Saving...'
                    : 'Saved on this device'}
              </AppText>
            </View>
          ) : (
            <>
              <View className="mt-5 flex-row items-center justify-between">
                <AppText>
                  Planned days reviewed: {doneDays}/{dates.length}
                </AppText>
              </View>
              <ProgressBar
                value={dates.length ? doneDays / dates.length : 0}
                className="mt-2 bg-gray-200"
              />
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setEditingEntry({
                    tripId: trip.id,
                    date: trip.startDate,
                    time: '',
                    location: '',
                    activities: [],
                  })
                }
                className="my-5 items-center rounded-full bg-brand-500 py-3"
              >
                <AppText className="font-sans-semibold text-white">+ Add Plan</AppText>
              </Pressable>
              {dates.length === 0 ? (
                <EmptyState title="No plans yet" message="Add a plan for any day of your trip." />
              ) : (
                dates.map((date) => (
                  <View key={date}>
                    <DayHeader
                      dayLabel={getDayLabel(trip.startDate, date)}
                      dateLabel={formatFullDate(date)}
                      done={doneDates.includes(date)}
                      onToggleDone={() => toggleDayDone(trip.id, date)}
                    />
                    {entries
                      .filter((e) => e.date === date)
                      .map((entry) => (
                        <ItineraryCard
                          key={entry.id}
                          entry={entry}
                          onToggleActivity={toggleActivity}
                          onEdit={() => setEditingEntry(entry)}
                          onDelete={() =>
                            confirmDelete(
                              'Delete this plan?',
                              `Remove the ${entry.time} plan at ${entry.location}?`,
                              () => deleteEntry(entry.id)
                            )
                          }
                        />
                      ))}
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
      <EditEntryModal
        entry={editingEntry}
        trip={trip}
        onClose={() => setEditingEntry(null)}
        onSave={saveEntry}
      />
      <NewTripModal
        visible={editingTrip}
        trip={trip}
        onClose={() => setEditingTrip(false)}
        onSubmit={(form) => {
          updateTrip(trip.id, form);
          setEditingTrip(false);
        }}
      />
    </View>
  );
}
