import { Pressable } from 'react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import { AppText } from '../common';

export default function TabBarItem({ icon: Icon, label, focused, onPress, onLongPress }) {
  const color = focused ? colors.brand[600] : colors.inactive;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center gap-1 py-1"
    >
      <Icon size={30} color={color} strokeWidth={1.75} />
      <AppText
        className={cn(
          'text-[11px]',
          focused ? 'font-sans-bold text-brand-600' : 'font-sans-medium text-inactive'
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
