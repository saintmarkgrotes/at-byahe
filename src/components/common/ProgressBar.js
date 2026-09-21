import { View } from 'react-native';
import { cn } from '../../utils/cn';

// `value` is between 0 and 1
export default function ProgressBar({ value = 0, className }) {
  const percent = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <View className={cn('h-2 overflow-hidden rounded-full bg-brand-100', className)}>
      <View className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
    </View>
  );
}
