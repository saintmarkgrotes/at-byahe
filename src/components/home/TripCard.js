import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { List, Plane, SquareChevronRight } from 'lucide-react-native';
import { formatRange, getTripLength } from '../../utils/date';
import { AppText, Pill } from '../common';

const STATUS_LABELS = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
};

export default function TripCard({ trip, width, onPress }) {
  const days = getTripLength(trip.startDate, trip.endDate);

  return (
    <Pressable
      onPress={onPress}
      style={{ width }}
      className="h-52 overflow-hidden rounded-[28px] bg-brand-500 shadow-lg shadow-brand-600/30 active:opacity-95"
    >
      {trip.image ? (
        <Image source={trip.image} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : null}

      {/* Fades the photo into brand green so the text stays readable */}
      <LinearGradient
        colors={['rgba(15,165,108,0)', 'rgba(15,165,108,0.95)']}
        locations={[0.2, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View className="absolute right-4 top-4">
        <Pill label={STATUS_LABELS[trip.status]} />
      </View>

      <View className="flex-1 justify-end p-5">
        <AppText variant="display" className="text-[34px] text-white">
          {trip.destination}
        </AppText>
        <AppText className="mt-1 font-sans-medium text-base text-white/95">
          {formatRange(trip.startDate, trip.endDate)}
        </AppText>

        <View className="mt-3 flex-row items-center gap-2">
          <Pill icon={Plane} label={`${days} days`} />
          <Pill icon={List} label={`${trip.activitiesCount} activities`} />
          <SquareChevronRight size={22} color="#FFFFFF" strokeWidth={1.75} />
        </View>
      </View>
    </Pressable>
  );
}
