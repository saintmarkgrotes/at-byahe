import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { AppText, Pill } from '../common';
import MapPreview from './MapPreview';

export default function ItineraryMap({ trip, entries }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [openError, setOpenError] = useState(false);
  const locations = [
    ...new Set(entries.map((entry) => (entry.location ?? '').trim()).filter(Boolean)),
  ];
  const location = locations.includes(selectedLocation) ? selectedLocation : null;
  const query = location ? `${location}, ${trip.destination}` : trip.destination;

  const openMap = async () => {
    setOpenError(false);
    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      );
    } catch {
      setOpenError(true);
    }
  };

  return (
    <View className="mt-5">
      <AppText variant="subheading">Trip map</AppText>
      <AppText variant="muted" className="mt-1">
        Save your destination and planned stops to explore offline.
      </AppText>
      <View className="my-4 flex-row flex-wrap gap-2">
        <Pill
          label={trip.destination}
          tone={location === null ? 'brand' : 'neutral'}
          className={location === null ? 'bg-brand-100' : undefined}
          accessibilityState={{ selected: location === null }}
          onPress={() => setSelectedLocation(null)}
        />
        {locations.map((place) => (
          <Pill
            key={place}
            label={place}
            tone={location === place ? 'brand' : 'neutral'}
            className={location === place ? 'bg-brand-100' : undefined}
            accessibilityState={{ selected: location === place }}
            onPress={() => setSelectedLocation(place)}
          />
        ))}
      </View>
      <MapPreview key={query} query={query} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${query} in Google Maps`}
        onPress={openMap}
        className="mt-4 items-center rounded-full bg-brand-500 px-4 py-3"
      >
        <AppText className="font-sans-semibold text-white">Open in Google Maps</AppText>
      </Pressable>
      {openError ? (
        <AppText accessibilityRole="alert" className="mt-2 text-sm text-red-500">
          Could not open Google Maps. Please try again.
        </AppText>
      ) : null}
      {locations.length === 0 ? (
        <AppText variant="muted" className="mt-4">
          Add locations to your itinerary plans to see them here.
        </AppText>
      ) : null}
    </View>
  );
}
