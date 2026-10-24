import { FlatList, View, useWindowDimensions } from 'react-native';
import { SCREEN_PADDING } from '../../constants/layout';
import TripCard from './TripCard';

const GAP = 12;

// Center upcoming cards with a peek at their neighbors to invite horizontal swiping.
export default function TripCarousel({ trips, onTripPress, previewAdjacent = false }) {
  const { width } = useWindowDimensions();
  const showPreview = previewAdjacent && trips.length > 1;
  const cardWidth = showPreview ? width * 0.78 : width - SCREEN_PADDING * 2;
  const sidePadding = (width - cardWidth) / 2;

  if (trips.length === 0) return null;
  if (trips.length === 1) {
    return (
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 16 }}>
        <TripCard trip={trips[0]} width={cardWidth} onPress={() => onTripPress?.(trips[0])} />
      </View>
    );
  }

  return (
    <FlatList
      key={cardWidth}
      horizontal
      data={trips}
      keyExtractor={(trip) => trip.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + GAP}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
      contentContainerStyle={{ paddingHorizontal: sidePadding, paddingBottom: 16 }}
      ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      renderItem={({ item }) => (
        <TripCard
          trip={item}
          width={cardWidth}
          compact={showPreview}
          onPress={() => onTripPress?.(item)}
        />
      )}
    />
  );
}
