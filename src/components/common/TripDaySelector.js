import { useMemo } from 'react';
import { FlatList, Pressable } from 'react-native';
import AppText from './AppText';
import { cn } from '../../utils/cn';
import {
  formatDateLabel,
  getDayLabel,
  getTripDayDate,
  getTripLength,
  isValidIsoDate,
  parseDate,
} from '../../utils/date';

export default function TripDaySelector({ startDate, endDate, value, onChange }) {
  const days = useMemo(() => {
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate) || endDate < startDate)
      return [];
    return Array.from({ length: getTripLength(startDate, endDate) }, (_, i) =>
      getTripDayDate(startDate, i + 1)
    );
  }, [startDate, endDate]);

  if (!days.length)
    return <AppText variant="caption">Choose your trip dates to select an activity day.</AppText>;

  return (
    <FlatList
      key={`${startDate}-${endDate}`}
      horizontal
      data={days}
      extraData={value}
      keyExtractor={(date) => date}
      keyboardShouldPersistTaps="handled"
      initialScrollIndex={Math.max(0, days.indexOf(value))}
      getItemLayout={(_, index) => ({ length: 144, offset: 144 * index, index })}
      renderItem={({ item: date }) => {
        const selected = date === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={`${getDayLabel(startDate, date)}, ${formatDateLabel(parseDate(date))}`}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(date)}
            style={{ width: 136, marginRight: 8 }}
            className={cn(
              'rounded-2xl border px-3 py-3',
              selected ? 'border-brand-600 bg-brand-600' : 'border-brand-100 bg-brand-50'
            )}
          >
            <AppText className={cn('font-sans-semibold', selected && 'text-white')}>
              {getDayLabel(startDate, date)}
            </AppText>
            <AppText variant="caption" className={cn('mt-1', selected && 'text-white')}>
              {formatDateLabel(parseDate(date))}
            </AppText>
          </Pressable>
        );
      }}
    />
  );
}
