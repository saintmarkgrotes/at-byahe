import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquareArrowLeft } from 'lucide-react-native';
import colors from '../../constants/colors';
import { SCREEN_PADDING } from '../../constants/layout';
import { AppText } from '../common';

// Mint gradient header: back button, trip name and date range
export default function ItineraryHeader({ title, dateLabel, onBackPress }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#FFFFFF', colors.mint]}
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: 28,
        paddingHorizontal: SCREEN_PADDING,
      }}
    >
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={onBackPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mt-3"
        >
          <SquareArrowLeft size={30} color={colors.ink} strokeWidth={1.75} />
        </Pressable>

        <View className="flex-1">
          <AppText variant="display" numberOfLines={1}>
            {title}
          </AppText>
          <AppText className="font-sans-medium text-xl text-ink">{dateLabel}</AppText>
        </View>
      </View>
    </LinearGradient>
  );
}