import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays, Clock } from 'lucide-react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import { formatDateLabel, formatTimeLabel } from '../../utils/date';
import { AppText } from '../common';
import { inputClassName } from './FormField';

const ICONS = { date: CalendarDays, time: Clock };
const FORMATTERS = { date: formatDateLabel, time: formatTimeLabel };

// A tappable field that opens the native date or time picker, so nothing is typed by hand.
// Android opens the system dialog and reports its result immediately. iOS has no built-in
// dialog, so this shows the spinner in a small bottom sheet with a Done button.
export default function PickerField({ mode, value, onChange, placeholder, hasError, minimumDate }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? new Date());
  const Icon = ICONS[mode];
  const format = FORMATTERS[mode];

  const openPicker = () => {
    setDraft(value ?? new Date());
    setOpen(true);
  };

  // Android: the dialog closes itself and calls onValueChange once, with the picked value.
  // onDismiss fires instead if the user backed out without choosing one.
  const handleValueChangeAndroid = (event, selected) => {
    setOpen(false);
    onChange(selected);
  };
  const handleDismissAndroid = () => setOpen(false);

  // iOS: the spinner fires onValueChange continuously as it's scrolled; only "Done" commits it.
  const handleValueChangeIOS = (event, selected) => setDraft(selected);

  const confirmIOS = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        className={cn(inputClassName(hasError), 'flex-row items-center justify-between')}
      >
        <AppText className={cn('font-sans text-base', value ? 'text-ink' : 'text-inactive')}>
          {value ? format(value) : placeholder}
        </AppText>
        <Icon size={18} color={colors.brand[600]} strokeWidth={1.75} />
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={draft}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          onValueChange={handleValueChangeAndroid}
          onDismiss={handleDismissAndroid}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
            {/* Stop the tap-to-close from firing when the sheet itself is tapped */}
            <Pressable className="rounded-t-[24px] bg-white pb-6" onPress={() => {}}>
              <View className="flex-row justify-end px-4 pt-3">
                <Pressable onPress={confirmIOS} hitSlop={8} accessibilityRole="button">
                  <AppText className="font-sans-semibold text-base text-brand-600">Done</AppText>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                minimumDate={minimumDate}
                onValueChange={handleValueChangeIOS}
                style={{ height: 200 }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}