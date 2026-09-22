import { useState } from 'react';
import { ScrollView, View } from 'react-native';
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
  const {
    selectedTrip: trip,
    packingLists,
    togglePacked,
    addPackingItem,
    deletePackingItem,
    renamePackingItem,
  } = useTrips();

  const [addingCategory, setAddingCategory] = useState(null); // which band has its Add box open
  const [activeMode, setActiveMode] = useState(null); // { group: 'Essentials:packed', mode: 'delete' | 'edit' }

  if (!trip) {
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

  const list = packingLists.find((entry) => entry.tripId === trip.id);
  const items = list?.items ?? [];
  const categoryOf = (item) => item.category ?? DEFAULT_CATEGORY;

  // One band per category. With no items yet we still show the default band so "Add" is reachable.
  const categories = items.length > 0 ? [...new Set(items.map(categoryOf))] : [DEFAULT_CATEGORY];

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
          dateLabel={`${trip.destination} Trip`}
          onBackPress={() => navigation.navigate('Home')}
        />

        <View style={{ paddingHorizontal: SCREEN_PADDING }}>
          {categories.map((category, index) => {
            const inCategory = items.filter((item) => categoryOf(item) === category);
            const packed = inCategory.filter((item) => item.packed);
            const notPacked = inCategory.filter((item) => !item.packed);
            const adding = addingCategory === category;

            return (
              <View key={category} className={index === 0 ? 'mt-6' : 'mt-10'}>
                <CategoryBand
                  title={category}
                  adding={adding}
                  onAddPress={() => setAddingCategory(adding ? null : category)}
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
                  mode={modeOf(`${category}:packed`)}
                  onToggleMode={(mode) => toggleMode(`${category}:packed`, mode)}
                  onToggleItem={(item) => togglePacked(list.id, item.id)}
                  onDeleteItem={(item) => deletePackingItem(list.id, item.id)}
                  onRenameItem={(item, title) => renamePackingItem(list.id, item.id, title)}
                />

                <ItemGroup
                  title="Items Not Yet Packed"
                  packed={false}
                  items={notPacked}
                  mode={modeOf(`${category}:notPacked`)}
                  onToggleMode={(mode) => toggleMode(`${category}:notPacked`, mode)}
                  onToggleItem={(item) => togglePacked(list.id, item.id)}
                  onDeleteItem={(item) => deletePackingItem(list.id, item.id)}
                  onRenameItem={(item, title) => renamePackingItem(list.id, item.id, title)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}