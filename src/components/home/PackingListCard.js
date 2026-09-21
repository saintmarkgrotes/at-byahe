import { View } from 'react-native';
import { Backpack, SquareChevronRight } from 'lucide-react-native';
import colors from '../../constants/colors';
import { formatRange } from '../../utils/date';
import { AppText, Card, ProgressBar } from '../common';

export default function PackingListCard({ list, onPress }) {
  const progress = list.total > 0 ? list.packed / list.total : 0;

  return (
    <Card onPress={onPress} className="p-4">
      <View className="flex-row items-center gap-4">
        <View className="h-[76px] w-[76px] items-center justify-center rounded-2xl bg-brand-500">
          <Backpack size={34} color="#FFFFFF" strokeWidth={1.75} />
        </View>

        <View className="flex-1">
          <AppText variant="heading" className="font-sans-bold" numberOfLines={1}>
            {list.title}
          </AppText>
          <AppText variant="muted" className="mt-0.5 text-base">
            {formatRange(list.startDate, list.endDate)}
          </AppText>
        </View>

        <SquareChevronRight size={28} color={colors.brand[600]} strokeWidth={1.75} />
      </View>

      <View className="mt-4">
        <View className="mb-2 flex-row justify-between">
          <AppText variant="caption">
            {list.packed} of {list.total} packed
          </AppText>
          <AppText variant="caption">{Math.round(progress * 100)}%</AppText>
        </View>
        <ProgressBar value={progress} />
      </View>
    </Card>
  );
}
