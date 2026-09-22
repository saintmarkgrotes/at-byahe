import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, CirclePlus } from 'lucide-react-native';
import colors from '../../constants/colors';
import { SCREEN_PADDING } from '../../constants/layout';
import { AppText, Pill } from '../common';

export default function GreetingHeader({ name, greeting, dateLabel, onNewTripPress }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#FFFFFF', colors.mint]} style={{ paddingTop: insets.top + 72 }}>
      <View
        className="flex-row items-end justify-between pb-7"
        style={{ paddingHorizontal: SCREEN_PADDING }}
      >
        <View>
          <AppText className="font-sans-medium text-[22px] text-brand-600">Hello{name ? ` ${name}` : ''},</AppText>
          <AppText variant="display">{greeting}</AppText>

          <View className="mt-3 flex-row items-center gap-2">
            <CalendarDays size={20} color={colors.brand[600]} strokeWidth={1.75} />
            <AppText variant="subheading" className="font-sans-medium">
              {dateLabel}
            </AppText>
          </View>
        </View>

        <Pill icon={CirclePlus} label="New Trip" size="md" tone="brand" onPress={onNewTripPress} />
      </View>
    </LinearGradient>
  );
}
