import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, SectionHeader } from '../components/common';
import {
  CalendarCard,
  GreetingHeader,
  NewTripModal,
  PackingListCard,
  TripCarousel,
} from '../components/home';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { useTrips } from '../context/TripsContext';
import useGreeting from '../hooks/useGreeting';
import { formatHeaderDate, parseDate } from '../utils/date';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();
  const { trips, packingLists, addTrip, selectTrip, profile, now: today } = useTrips();
  const [newTripOpen, setNewTripOpen] = useState(false);

  const currentTrips = trips.filter((trip) => trip.status === 'ongoing');
  const upcomingTrips = trips.filter((trip) => trip.status === 'planned');
  const pastTrips = trips.filter((trip) => trip.status === 'completed');
  const nextTrip = currentTrips[0] ?? upcomingTrips[0];
  const tripRange = nextTrip
    ? { start: parseDate(nextTrip.startDate), end: parseDate(nextTrip.endDate) }
    : null;

  const handleCreateTrip = (form) => {
    addTrip(form); // saves the trip and selects it
    setNewTripOpen(false);
    navigation.navigate('Itinerary'); // remove this line to stay on Home after saving
  };

  const handleTripPress = (trip) => {
    selectTrip(trip.id);
    navigation.navigate('Itinerary');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >
        <GreetingHeader
          name={profile.firstName.trim()}
          greeting={greeting}
          dateLabel={formatHeaderDate(today)}
          onNewTripPress={() => setNewTripOpen(true)}
        />

        {/* Calendar */}
        <View className="mt-4 flex-row gap-3" style={{ paddingHorizontal: SCREEN_PADDING }}>
          <View className="flex-1">
            <SectionHeader size="sm" title="Calendar" />
            <CalendarCard today={today} tripRange={tripRange} />
          </View>
        </View>

        {[
          { title: 'Current Trips', data: currentTrips },
          { title: 'Upcoming Trips', data: upcomingTrips },
          { title: 'Past Trips', data: [...pastTrips].reverse() },
        ].map(({ title, data }) =>
          data.length > 0 ? (
            <View key={title} className="mt-8">
              <SectionHeader
                title={title}
                subtitle="Tap a trip to view its plans"
                className="px-6"
              />
              <TripCarousel trips={data} onTripPress={handleTripPress} />
            </View>
          ) : null
        )}
        {trips.length === 0 ? (
          <View className="mt-8" style={{ paddingHorizontal: SCREEN_PADDING }}>
            <EmptyState title="No trips yet" message="Tap + New Trip to plan your first trip." />
          </View>
        ) : null}

        {/* Packing lists */}
        <View className="mt-8" style={{ paddingHorizontal: SCREEN_PADDING }}>
          <SectionHeader title="Packing List" />
          {packingLists.length === 0 ? (
            <EmptyState
              title="No packing lists yet"
              message="Add things to bring when you create a trip, or list them on the Packing tab."
            />
          ) : (
            packingLists.map((list) => (
              <PackingListCard
                key={list.id}
                list={list}
                onPress={() => {
                  selectTrip(list.tripId);
                  navigation.navigate('Packing');
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <NewTripModal
        visible={newTripOpen}
        onClose={() => setNewTripOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </View>
  );
}
