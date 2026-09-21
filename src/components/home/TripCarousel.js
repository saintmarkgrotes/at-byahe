import { FlatList, View, useWindowDimensions } from 'react-native';
import { SCREEN_PADDING } from '../../constants/layout';
import TripCard from './TripCard';

const GAP = 12;

// Horizontal, snapping list of trip cards
export default function TripCarousel({ trips, onTripPress }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SCREEN_PADDING * 2;

  return (
    <FlatList
      horizontal
      data={trips}
      keyExtractor={(trip) => trip.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + GAP}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 16 }}
      ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      renderItem={({ item }) => (
        <TripCard trip={item} width={cardWidth} onPress={() => onTripPress?.(item)} />
      )}
    />
  );
}
