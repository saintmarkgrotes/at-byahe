import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '../components/common';
import {
  CalendarCard,
  GreetingHeader,
  PackingListCard,
  TripCarousel,
  WeatherCard,
} from '../components/home';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { packingLists, trips, user, weather } from '../data/mockData';
import useGreeting from '../hooks/useGreeting';
import { formatHeaderDate, parseDate } from '../utils/date';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();

  const today = useMemo(() => new Date(), []);
  const nextTrip = trips[0];
  const tripRange = nextTrip
    ? { start: parseDate(nextTrip.startDate), end: parseDate(nextTrip.endDate) }
    : null;

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
          onNewTripPress={() => navigation.navigate('Itinerary')}
        />

        {/* Upcoming trips */}
        <View className="mt-8">
          <SectionHeader
            title="Upcoming Trips"
            subtitle="Swipe through your trips"
            actionLabel="View All"
            className="px-6"
            onActionPress={() => navigation.navigate('Itinerary')}
          />
          <TripCarousel trips={trips} onTripPress={() => navigation.navigate('Itinerary')} />
        </View>

        {/* Calendar + weather */}
        <View className="mt-4 flex-row gap-3" style={{ paddingHorizontal: SCREEN_PADDING }}>
          <View className="flex-1">
            <SectionHeader size="sm" title="Calendar" />
            <CalendarCard today={today} tripRange={tripRange} className="flex-1" />
          </View>
          <View className="w-[120px]">
            <SectionHeader size="sm" title="Today" />
            <WeatherCard
              temperature={weather.temperature}
              location={weather.location}
              className="flex-1"
            />
          </View>
        </View>

        {/* Packing lists */}
        <View className="mt-8" style={{ paddingHorizontal: SCREEN_PADDING }}>
          <SectionHeader title="Packing List" />
          {packingLists.map((list) => (
            <PackingListCard
              key={list.id}
              list={list}
              onPress={() => navigation.navigate('Packing')}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
