import { useState } from 'react';
import { TextInput, View } from 'react-native';
import colors from '../../constants/colors';
import { Pill } from '../common';

// Text field + Add pill for adding a new item to the open category.
// Submitting adds the item and closes the row, so the empty box doesn't linger.
export default function AddItemRow({ onAdd, onClose }) {
  const [title, setTitle] = useState('');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle('');
    onClose?.();
  };

  return (
    <View className="mt-3 flex-row items-center gap-2">
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Item name"
        placeholderTextColor={colors.inactive}
        onSubmitEditing={submit}
        returnKeyType="done"
        autoFocus
        className="h-[52px] flex-1 rounded-2xl border border-gray-200 bg-white px-4 font-sans text-base text-ink"
      />
      <Pill label="Add" tone="brand" size="sm" onPress={submit} />
    </View>
  );
}
