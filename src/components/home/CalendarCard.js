import { View } from 'react-native';
import { cn } from '../../utils/cn';
import { getWeekDays, isSameDay, isWithinRange } from '../../utils/date';
import { AppText, Card } from '../common';

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Current week at a glance. Today is filled, days inside `tripRange` are tinted.
export default function CalendarCard({ today, tripRange, className }) {
  const days = getWeekDays(today);

  return (
    <Card className={cn('flex-row items-center justify-between px-2 py-3', className)}>
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const inTrip = tripRange && isWithinRange(day, tripRange.start, tripRange.end);

        return (
          <View key={day.toISOString()} className="items-center gap-1.5">
            <AppText variant="caption" className="text-[11px]">
              {LETTERS[day.getDay()]}
            </AppText>
            <View
              className={cn(
                'h-7 w-7 items-center justify-center rounded-full',
                isToday && 'bg-brand-500',
                !isToday && inTrip && 'bg-brand-100'
              )}
            >
              <AppText
                className={cn(
                  'font-sans-semibold text-xs',
                  isToday ? 'text-white' : inTrip ? 'text-brand-600' : 'text-ink'
                )}
              >
                {day.getDate()}
              </AppText>
            </View>
          </View>
        );
      })}
    </Card>
  );
}
