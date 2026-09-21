import { Pressable, TextInput, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import colors from '../../constants/colors';
import { AppText } from '../common';
import { inputClassName } from './FormField';

// Type something, press Add (or the keyboard's return key) and it becomes a removable chip.
// The parent owns both the list (`items`) and the box text (`text`).
export default function ChipInput({ items, onChange, text, onChangeText, placeholder }) {
  const addItem = () => {
    const value = text.trim();
    if (!value) return;

    const isDuplicate = items.some((item) => item.toLowerCase() === value.toLowerCase());
    if (!isDuplicate) onChange([...items, value]);
    onChangeText('');
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <View>
      <View className="flex-row gap-2">
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={addItem}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder={placeholder}
          placeholderTextColor={colors.inactive}
          className={`flex-1 ${inputClassName(false)}`}
        />
        <Pressable
          onPress={addItem}
          accessibilityRole="button"
          accessibilityLabel="Add"
          className="items-center justify-center rounded-2xl bg-brand-500 px-4"
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>

      {items.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {items.map((item, index) => (
            <View
              key={`${item}-${index}`}
              className="flex-row items-center gap-1.5 rounded-full bg-brand-100 py-1.5 pl-3 pr-2"
            >
              <AppText className="text-sm text-brand-700">{item}</AppText>
              <Pressable
                onPress={() => removeItem(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item}`}
              >
                <X size={14} color={colors.brand[600]} strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}