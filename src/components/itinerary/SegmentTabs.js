import { Pressable, View } from 'react-native';
import { cn } from '../../utils/cn';
import { AppText } from '../common';

// Row of equal-width pills (Itinerary / Map / Notes). The active one is green.
export default function SegmentTabs({ tabs, active, onChange }) {
  return (
    <View className="flex-row gap-3">
      {tabs.map((tab) => {
        const isActive = tab === active;

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn('flex-1 items-center rounded-full py-3', isActive ? 'bg-brand-500' : 'bg-gray-200')}
          >
            <AppText className={cn('font-sans-medium text-base', isActive ? 'text-white' : 'text-muted')}>
              {tab}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}