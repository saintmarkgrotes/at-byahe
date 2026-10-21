import { View } from 'react-native';
import { cn } from '../../utils/cn';
import { ActionButton, AppText } from '../common';
import PackingItemRow from './PackingItemRow';

// "Items Already Packed" / "Items Not Yet Packed": a heading with Edit + Delete, then the rows.
// `mode` is 'delete', 'edit' or null. Pressing the active button again ("Done") turns it off.
export default function ItemGroup({
  title,
  packed,
  items,
  mode,
  onToggleMode,
  onToggleItem,
  onDeleteItem,
  onRenameItem,
}) {
  if (items.length === 0) return null;

  return (
    <View className="mt-8">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <AppText className={cn('shrink font-sans-semibold text-xl', packed ? 'text-brand-600' : 'text-ink/60')}>
          {title}
        </AppText>

        <View className="flex-row gap-2">
          <ActionButton
            action="edit"
            active={mode === 'edit'}
            onPress={() => onToggleMode('edit')}
          />
          <ActionButton
            action="delete"
            active={mode === 'delete'}
            onPress={() => onToggleMode('delete')}
          />
        </View>
      </View>

      {items.map((item) => (
        <PackingItemRow
          key={item.id}
          item={item}
          showDelete={mode === 'delete'}
          editMode={mode === 'edit'}
          onToggle={() => onToggleItem(item)}
          onDelete={() => onDeleteItem(item)}
          onRename={(title) => onRenameItem(item, title)}
        />
      ))}
    </View>
  );
}
