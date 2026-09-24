import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState } from '../components/common';
import { ItineraryHeader } from '../components/itinerary';
import { AddItemRow, CategoryBand, ItemGroup } from '../components/packing';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
import { DEFAULT_CATEGORY, useTrips } from '../context/TripsContext';

export default function PackingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // All trips now, not just the selected one, so every trip's packing list shows up here.
  const { trips, packingLists, togglePacked, addPackingItem, deletePackingItem, renamePackingItem } =
    useTrips();

  // Keys are prefixed with the trip id so two trips with a category of the same
  // name (e.g. both have "Essentials") don't open/close or edit each other's rows.
  const [addingCategory, setAddingCategory] = useState(null); // `${tripId}:${category}` currently open
  const [activeMode, setActiveMode] = useState(null); // { group: `${tripId}:${category}:packed`, mode }

  // Ask before deleting, so a stray tap can't remove an item from the list
  const confirmDeleteItem = (trip, list, item) => {
    Alert.alert(
      'Delete this item?',
      `"${item.title}" will be removed from your ${trip.destination} packing list. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePackingItem(list.id, item.id) },
      ]
    );
  };

  if (trips.length === 0) {
    return (
      <View className="flex-1 justify-center bg-white" style={{ paddingHorizontal: SCREEN_PADDING }}>
        <EmptyState
          title="No trips yet"
          message="Create a trip from Home with + New Trip, then list what you need to pack here."
          actionLabel="Go to Home"
          onActionPress={() => navigation.navigate('Home')}
        />
      </View>
    );
  }

  const categoryOf = (item) => item.category ?? DEFAULT_CATEGORY;
  const modeOf = (group) => (activeMode?.group === group ? activeMode.mode : null);
  const toggleMode = (group, mode) =>
    setActiveMode((current) =>
      current?.group === group && current.mode === mode ? null : { group, mode }
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24 }}
      >
        <ItineraryHeader
          title="Packing List"
          dateLabel={`${trips.length} trip${trips.length > 1 ? 's' : ''}`}
          onBackPress={() => navigation.navigate('Home')}
        />

        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          {trips.map((trip, tripIndex) => {
            const list = packingLists.find((entry) => entry.tripId === trip.id);
            const items = list?.items ?? [];
            // One band per category. With no items yet we still show the default band so "Add" is reachable.
            const categories = items.length > 0 ? [...new Set(items.map(categoryOf))] : [DEFAULT_CATEGORY];

            return (
              <View key={trip.id} className={tripIndex === 0 ? 'mt-6' : 'mt-10'}>
                <AppText variant="heading">{trip.destination}</AppText>

                {categories.map((category, index) => {
                  const inCategory = items.filter((item) => categoryOf(item) === category);
                  const packed = inCategory.filter((item) => item.packed);
                  const notPacked = inCategory.filter((item) => !item.packed);
                  const addingKey = `${trip.id}:${category}`;
                  const adding = addingCategory === addingKey;

                  return (
                    <View key={category} className={index === 0 ? 'mt-4' : 'mt-10'}>
                      <CategoryBand
                        title={category}
                        adding={adding}
                        onAddPress={() => setAddingCategory(adding ? null : addingKey)}
                      />
                      <View className="mt-3 h-px bg-gray-300" />

                      {adding ? (
                        <AddItemRow onAdd={(title) => addPackingItem(trip.id, title, category)} />
                      ) : null}

                      {inCategory.length === 0 ? (
                        <AppText variant="muted" className="mt-8 text-center">
                          Nothing to pack yet. Tap Add and list everything you need to bring.
                        </AppText>
                      ) : null}

                      <ItemGroup
                        title="Items Already Packed"
                        packed
                        items={packed}
                        mode={modeOf(`${trip.id}:${category}:packed`)}
                        onToggleMode={(mode) => toggleMode(`${trip.id}:${category}:packed`, mode)}
                        onToggleItem={(item) => togglePacked(list.id, item.id)}
                        onDeleteItem={(item) => confirmDeleteItem(trip, list, item)}
                        onRenameItem={(item, title) => renamePackingItem(list.id, item.id, title)}
                      />

                      <ItemGroup
                        title="Items Not Yet Packed"
                        packed={false}
                        items={notPacked}
                        mode={modeOf(`${trip.id}:${category}:notPacked`)}
                        onToggleMode={(mode) => toggleMode(`${trip.id}:${category}:notPacked`, mode)}
                        onToggleItem={(item) => togglePacked(list.id, item.id)}
                        onDeleteItem={(item) => confirmDeleteItem(trip, list, item)}
                        onRenameItem={(item, title) => renamePackingItem(list.id, item.id, title)}
                      />
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}