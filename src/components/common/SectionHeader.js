import { Pressable, View } from 'react-native';
import { cn } from '../../utils/cn';
import AppText from './AppText';

// size "lg": big title with optional subtitle + action (Upcoming Trips, Packing List)
// size "sm": small label above a card (Calendar, Today)
export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  size = 'lg',
  className,
}) {
  const isLarge = size === 'lg';

  return (
    <View
      className={cn('flex-row items-end justify-between', isLarge ? 'mb-4' : 'mb-2', className)}
    >
      <View>
        <AppText variant={isLarge ? 'heading' : 'subheading'}>{title}</AppText>
        {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
      </View>

      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText variant="muted">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
