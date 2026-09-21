import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Pill, ProgressBar } from '../components/common';
import {
  DayHeader,
  ItineraryCard,
  ItineraryHeader,
  SegmentTabs,
} from '../components/itinerary';
import colors from '../constants/colors';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { itinerary, trips } from '../data/mockData';
import { formatFullDate, formatLongRange, getDayLabel, getTripLength } from '../utils/date';
import PlaceholderScreen from './PlaceholderScreen';

const TABS = ['Itinerary', 'Map', 'Notes'];

const STATUS_LABELS = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
};

export default function ItineraryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const trip = trips[0];
  const [activeTab, setActiveTab] = useState('Itinerary');
  const [entries, setEntries] = useState(() =>
    itinerary.filter((entry) => entry.tripId === trip?.id)
  );
  const [doneDates, setDoneDates] = useState([]); // dates (e.g. '2026-09-19') marked done

  if (!trip) return <PlaceholderScreen title="Itinerary" />;

  const totalDays = getTripLength(trip.startDate, trip.endDate);
  const progress = totalDays > 0 ? doneDates.length / totalDays : 0;

  const toggleActivity = (entryId, activityId) =>
    setEntries((current) =>
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

  const toggleDayDone = (date) =>
    setDoneDates((current) =>
      current.includes(date) ? current.filter((d) => d !== date) : [...current, date]
    );

  const deleteEntry = (entryId) =>
    setEntries((current) => current.filter((entry) => entry.id !== entryId));

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >
        <ItineraryHeader
          title={trip.destination}
          dateLabel={formatLongRange(trip.startDate, trip.endDate)}
          onBackPress={() => navigation.navigate('Home')}
        />

        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          <View className="mt-6">
            <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          </View>

          {/* Trip progress */}
          <View className="mt-6">
            <View className="mb-2 flex-row justify-between">
              <AppText className="font-sans-medium text-base">Trip progress</AppText>
              <AppText className="font-sans-medium text-base">
                {doneDates.length}/{totalDays}
              </AppText>
            </View>
            <ProgressBar value={progress} className="bg-gray-200" />
          </View>

          <View className="mt-5 h-px bg-gray-200" />

          {activeTab === 'Itinerary' ? (
            <>
              {/* "Itinerary" title band + trip status */}
              <LinearGradient
                colors={[colors.mint, 'rgba(200,245,223,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <AppText variant="display" className="text-[40px] leading-[48px] text-brand-600">
                  Itinerary
                </AppText>
                <Pill label={STATUS_LABELS[trip.status]} tone="brand" />
              </LinearGradient>

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
                      onToggleDone={() => toggleDayDone(entry.date)}
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
            </>
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