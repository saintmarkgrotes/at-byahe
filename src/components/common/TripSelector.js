import { Pressable, ScrollView } from 'react-native';
import { useTrips } from '../../context/TripsContext';
import AppText from './AppText';
import { formatRange } from '../../utils/date';
export default function TripSelector() {
  const { trips, selectedTrip, selectTrip } = useTrips();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 16 }}
    >
      {trips.map((trip) => (
        <Pressable
          key={trip.id}
          accessibilityRole="button"
          accessibilityState={{ selected: trip.id === selectedTrip?.id }}
          onPress={() => selectTrip(trip.id)}
          className={
            trip.id === selectedTrip?.id
              ? 'rounded-2xl bg-brand-100 px-4 py-3'
              : 'rounded-2xl bg-gray-100 px-4 py-3'
          }
        >
          <AppText className="font-sans-semibold">{trip.destination}</AppText>
          <AppText variant="caption">{formatRange(trip.startDate, trip.endDate)}</AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}
