import { useMemo, useState } from 'react';
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
  WeatherCard,
} from '../components/home';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { user } from '../constants/user';
import { useTrips } from '../context/TripsContext';
import useGreeting from '../hooks/useGreeting';
import { formatHeaderDate, parseDate } from '../utils/date';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();
  const { trips, packingLists, addTrip, selectTrip } = useTrips();
  const [newTripOpen, setNewTripOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const nextTrip = trips[0];
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
          name={user.firstName}
          greeting={greeting}
          dateLabel={formatHeaderDate(today)}
          onNewTripPress={() => setNewTripOpen(true)}
        />

        {/* Upcoming trips */}
        <View className="mt-8">
          <SectionHeader
            title="Upcoming Trips"
            subtitle={trips.length > 0 ? 'Swipe through your trips' : 'Plan your first trip'}
            actionLabel={trips.length > 0 ? 'View All' : undefined}
            className="px-6"
            onActionPress={() => navigation.navigate('Itinerary')}
          />
          {trips.length > 0 ? (
            <TripCarousel trips={trips} onTripPress={handleTripPress} />
          ) : (
            <View style={{ paddingHorizontal: SCREEN_PADDING }}>
              <EmptyState title="No trips yet" message="Tap + New Trip to plan your first trip." />
            </View>
          )}
        </View>

        {/* Calendar + weather */}
        <View className="mt-4 flex-row gap-3" style={{ paddingHorizontal: SCREEN_PADDING }}>
          <View className="flex-1">
            <SectionHeader size="sm" title="Calendar" />
            <CalendarCard today={today} tripRange={tripRange} className="flex-1" />
          </View>
          <View className="w-[120px]">
            <SectionHeader size="sm" title="Today" />
            <WeatherCard className="flex-1" />
          </View>
        </View>

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