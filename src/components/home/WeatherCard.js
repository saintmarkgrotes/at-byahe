import { View } from 'react-native';
import { CloudSun } from 'lucide-react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import { AppText, Card } from '../common';

export default function WeatherCard({ temperature = null, location = null, className }) {
  return (
    <Card className={cn('items-center justify-center px-3 py-3', className)}>
      <View className="flex-row items-center gap-1">
        <AppText variant="display" className="text-[32px] leading-[38px] text-brand-600">
          {temperature ?? '--'}°
        </AppText>
        <CloudSun size={34} color={colors.brand[600]} strokeWidth={1.75} />
      </View>
      <AppText variant="caption" className="mt-1 text-center text-[10px]" numberOfLines={2}>
        {location ?? 'No weather data'}
      </AppText>
    </Card>
  );
}
