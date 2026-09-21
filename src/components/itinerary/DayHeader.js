import { Pressable, View } from 'react-native';
import { CalendarClock, Circle, CircleCheck } from 'lucide-react-native';
import colors from '../../constants/colors';
import { AppText } from '../common';

// "Day One / Sep 19, 2026 (Sat)" on the left, "Mark day done" toggle on the right
export default function DayHeader({ dayLabel, dateLabel, done, onToggleDone }) {
  return (
    <View className="mt-8 flex-row items-end justify-between">
      <View>
        <View className="flex-row items-center gap-2">
          <CalendarClock size={20} color={colors.brand[600]} strokeWidth={1.75} />
          <AppText variant="subheading">{dayLabel}</AppText>
        </View>
        <AppText className="mt-1 font-sans-semibold text-xl">{dateLabel}</AppText>
      </View>

      <Pressable
        onPress={onToggleDone}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        className="flex-row items-center gap-1.5 pb-1"
      >
        {done ? (
          <CircleCheck size={20} color={colors.brand[500]} strokeWidth={1.75} />
        ) : (
          <Circle size={20} color={colors.muted} strokeWidth={1.75} />
        )}
        <AppText variant="muted">Mark day done</AppText>
      </Pressable>
    </View>
  );
}