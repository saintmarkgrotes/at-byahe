import { Pressable } from 'react-native';
import { Check, Pencil, Trash2 } from 'lucide-react-native';
import { cn } from '../../utils/cn';
import AppText from './AppText';

const ACTIONS = {
  edit: {
    label: 'Edit',
    icon: Pencil,
    color: '#1D4ED8',
    box: 'border-blue-200 bg-blue-50 active:bg-blue-100',
    text: 'text-blue-700',
  },
  delete: {
    label: 'Delete',
    icon: Trash2,
    color: '#B91C1C',
    box: 'border-red-200 bg-red-50 active:bg-red-100',
    text: 'text-red-700',
  },
};

// Shared edit/delete controls, including compact row actions and packing mode toggles.
export default function ActionButton({
  action,
  onPress,
  label,
  active,
  iconOnly = false,
  accessibilityLabel,
}) {
  const appearance = ACTIONS[action];
  const Icon = active ? Check : appearance.icon;
  const text = active ? 'Done' : (label ?? appearance.label);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={active === undefined ? undefined : { selected: active }}
      className={cn(
        'min-h-10 shrink-0 flex-row items-center justify-center gap-1.5 rounded-full border',
        iconOnly ? 'w-10 p-2' : 'px-3 py-2',
        appearance.box
      )}
    >
      <Icon size={16} color={appearance.color} strokeWidth={1.75} />
      {!iconOnly ? (
        <AppText className={cn('font-sans-medium text-sm', appearance.text)}>{text}</AppText>
      ) : null}
    </Pressable>
  );
}
