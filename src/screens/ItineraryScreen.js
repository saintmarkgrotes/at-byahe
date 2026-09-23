import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState, Pill, ProgressBar } from '../components/common';
import {
  DayHeader,
  ItineraryCard,
  ItineraryHeader,
  SegmentTabs,
} from '../components/itinerary';
import colors from '../constants/colors';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { useTrips } from '../context/TripsContext';
import { formatFullDate, formatLongRange, getDayLabel, getTripLength } from '../utils/date';


const TABS = ['Itinerary', 'Map', 'Notes'];

const STATUS_LABELS = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
};

export default function ItineraryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // All trips now, not just the selected one, so every trip's itinerary shows up here.
  const { trips, itinerary, doneDatesByTrip, toggleActivity, toggleDayDone, deleteEntry } =
    useTrips();
  const [activeTab, setActiveTab] = useState('Itinerary');

  if (trips.length === 0) {
    return (
      <View className="flex-1 justify-center bg-white" style={{ paddingHorizontal: SCREEN_PADDING }}>
        <EmptyState
          title="No trips yet"
          message="Create a trip from Home with + New Trip and its itinerary will show here."
          actionLabel="Go to Home"
          onActionPress={() => navigation.navigate('Home')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >
        <ItineraryHeader
          title="Itinerary"
          dateLabel={`${trips.length} trip${trips.length > 1 ? 's' : ''}`}
          onBackPress={() => navigation.navigate('Home')}
        />

        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <View className="mt-6">
            <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          </View>

          <View className="mt-5 h-px bg-gray-200" />

          {activeTab === 'Itinerary' ? (
            // One block per trip: title + status + progress, then that trip's day entries.
            trips.map((trip) => {
              const entries = itinerary.filter((entry) => entry.tripId === trip.id);
              const doneDates = doneDatesByTrip[trip.id] ?? [];
              const totalDays = getTripLength(trip.startDate, trip.endDate);
              const progress = totalDays > 0 ? doneDates.length / totalDays : 0;

              return (
                <View key={trip.id} className="mt-8">
                  <LinearGradient
                    colors={[colors.mint, 'rgba(200,245,223,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View className="shrink">
                      <AppText
                        variant="display"
                        numberOfLines={1}
                        className="text-[28px] leading-[34px] text-brand-600"
                      >
                        {trip.destination}
                      </AppText>
                      <AppText variant="muted" className="mt-0.5">
                        {formatLongRange(trip.startDate, trip.endDate)}
                      </AppText>
                    </View>
                    <Pill label={STATUS_LABELS[trip.status]} tone="brand" />
                  </LinearGradient>

                  <View className="mt-3 flex-row justify-between">
                    <AppText className="font-sans-medium text-base">Trip progress</AppText>
                    <AppText className="font-sans-medium text-base">
                      {doneDates.length}/{totalDays}
                    </AppText>
                  </View>
                  <ProgressBar value={progress} className="mt-1 bg-gray-200" />

                  {entries.length === 0 ? (
                    <AppText variant="muted" className="mt-8 text-center">
                      No plans yet
                    </AppText>
                  ) : (
                    entries.map((entry) => (
                      <View key={entry.id}>
                        <DayHeader
                          dayLabel={getDayLabel(trip.startDate, entry.date)}
                          dateLabel={formatFullDate(entry.date)}
                          done={doneDates.includes(entry.date)}
                          onToggleDone={() => toggleDayDone(trip.id, entry.date)}
                        />
                        <ItineraryCard
                          entry={entry}
                          onToggleActivity={toggleActivity}
                          onDelete={() => deleteEntry(entry.id)}
                          // onEdit: no edit form exists yet. Wire it up when you build one.
                        />
                      </View>
                    ))
                  )}
                </View>
              );
            })
          ) : (
            <View className="mt-16 items-center">
              <AppText variant="heading">{activeTab}</AppText>
              <AppText variant="muted">Coming soon</AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}