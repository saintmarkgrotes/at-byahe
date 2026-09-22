import { Pressable, View } from 'react-native';
import { TextCursorInput, Trash2 } from 'lucide-react-native';
import { cn } from '../../utils/cn';
import { AppText } from '../common';
import PackingItemRow from './PackingItemRow';

// "Items Already Packed" / "Items Not Yet Packed": a heading with Delete + Edit, then the rows
export default function ItemGroup({
  title,
  packed,
  items,
  deleteMode,
  onToggleDeleteMode,
  onEdit,
  onToggleItem,
  onDeleteItem,
}) {
  if (items.length === 0) return null;

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between gap-2">
        <AppText className={cn('shrink font-sans-semibold text-xl', packed ? 'text-brand-600' : 'text-ink/60')}>
          {title}
        </AppText>

        <View className="flex-row gap-2">
          <Pressable
            onPress={onToggleDeleteMode}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5"
          >
            <Trash2 size={14} color="#F87171" strokeWidth={1.75} />
            <AppText className="font-sans-medium text-sm text-red-400">{deleteMode ? 'Done' : 'Delete'}</AppText>
          </Pressable>

          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5"
          >
            <TextCursorInput size={14} color="#3B82F6" strokeWidth={1.75} />
            <AppText className="font-sans-medium text-sm text-blue-500">Edit</AppText>
          </Pressable>
        </View>
      </View>

      {items.map((item) => (
        <PackingItemRow
          key={item.id}
          item={item}
          showDelete={deleteMode}
          onToggle={() => onToggleItem(item)}
          onDelete={() => onDeleteItem(item)}
        />
      ))}
    </View>
  );
}