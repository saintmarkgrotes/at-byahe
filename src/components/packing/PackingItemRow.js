import { Pressable, TextInput, View } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import { getPackingIcon } from '../../utils/packingIcons';
import { AppText } from '../common';

// One item: checkbox, icon and name. Tap the row to pack / unpack it.
// In edit mode the name becomes a text box; in delete mode a trash button appears.
export default function PackingItemRow({ item, showDelete, editMode, onToggle, onDelete, onRename }) {
  const Icon = getPackingIcon(item.title);
  const nameStyle = item.packed ? 'font-sans-bold text-brand-700' : 'font-sans-medium text-muted';

  return (
    <View className="ml-12 mt-3 flex-row items-center gap-2">
      <Pressable
        onPress={editMode ? undefined : onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.packed }}
        className={cn(
          'h-[52px] flex-1 flex-row items-center rounded-2xl border bg-white px-4',
          item.packed ? 'border-brand-200' : 'border-gray-200'
        )}
      >
        {item.packed ? (
          <View className="h-6 w-6 items-center justify-center rounded-md bg-brand-600">
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : (
          <View className="h-6 w-6 items-center justify-center rounded-md border border-gray-300">
            <Check size={14} color="#D1D5DB" strokeWidth={2.5} />
          </View>
        )}

        <View className="mx-4 w-8 items-center">
          <Icon size={26} color={item.packed ? colors.brand[600] : colors.inactive} strokeWidth={1.5} />
        </View>

        {editMode ? (
          <TextInput
            defaultValue={item.title}
            onChangeText={onRename} // empty names are ignored, so the old name stays
            placeholder="Item name"
            placeholderTextColor={colors.inactive}
            className={cn('flex-1 border-b border-brand-200 py-1 font-sans text-base', nameStyle)}
          />
        ) : (
          <AppText numberOfLines={1} className={cn('flex-1', nameStyle)}>
            {item.title}
          </AppText>
        )}
      </Pressable>

      {showDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
          className="h-10 w-10 items-center justify-center rounded-full bg-red-50"
        >
          <Trash2 size={18} color="#F87171" strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}