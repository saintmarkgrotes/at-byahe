import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import colors from '../../constants/colors';
import { SCREEN_PADDING } from '../../constants/layout';
import { formatTimeLabel, parseTimeLabel, parseDate, toIsoDate } from '../../utils/date';
import { withPending } from '../../utils/list';
import { AppText } from '../common';
import ChipInput from '../home/ChipInput';
import FormField, { inputClassName } from '../home/FormField';
import PickerField from '../home/PickerField';

// Bottom-sheet form for editing one itinerary entry (time, location, activities).
// It is open whenever `entry` is set, and closed when `entry` is null.
//   onSave(entryId, { time, location, activities })
export default function EditEntryModal(props) {
  if (!props.entry) return null;
  return <EntryForm key={props.entry.id ?? 'new'} {...props} />;
}

function EntryForm({ entry, trip, onClose, onSave }) {
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState(() => parseDate(entry.date));
  const [time, setTime] = useState(() => parseTimeLabel(entry.time)); // Date | null
  const [location, setLocation] = useState(entry.location);
  const [activities, setActivities] = useState(() =>
    entry.activities.map((activity) => activity.title)
  );
  const [activityText, setActivityText] = useState('');
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const finalActivities = withPending(activities, activityText);

    const nextErrors = {};
    if (!date || toIsoDate(date) < trip.startDate || toIsoDate(date) > trip.endDate)
      nextErrors.date = 'Choose a date within this trip.';
    if (!time) nextErrors.time = 'Pick a start time.';
    if (finalActivities.length === 0) {
      nextErrors.activities = 'Add at least one activity. To remove this plan, use Delete.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      onSave(entry.id, {
        date: toIsoDate(date),
        time: formatTimeLabel(time),
        location: location.trim() || trip.destination,
        activities: finalActivities,
      });
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <Modal
      visible={entry !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        {/* Tap the dark area above the sheet to close */}
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close" />

        <View
          className="rounded-t-[28px] bg-white"
          style={{ maxHeight: '90%', paddingBottom: insets.bottom + 12 }}
        >
          {/* Header */}
          <View
            className="flex-row items-start justify-between pt-6"
            style={{ paddingHorizontal: SCREEN_PADDING }}
          >
            <View>
              <AppText variant="heading">{entry?.id ? 'Edit Plan' : 'Add Plan'}</AppText>
              <AppText variant="muted">Change the time, place or activities</AppText>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={24} color={colors.ink} strokeWidth={1.75} />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 8 }}
          >
            <FormField label="Date" error={errors.date}>
              <PickerField
                mode="date"
                value={date}
                onChange={setDate}
                placeholder="Select date"
                hasError={!!errors.date}
                minimumDate={trip ? parseDate(trip.startDate) : undefined}
                maximumDate={trip ? parseDate(trip.endDate) : undefined}
              />
            </FormField>
            <FormField label="Start time" error={errors.time}>
              <PickerField
                mode="time"
                value={time}
                onChange={setTime}
                placeholder="Select time"
                hasError={!!errors.time}
              />
            </FormField>

            <FormField label="Location" hint="Defaults to the destination if left empty.">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Address or area"
                placeholderTextColor={colors.inactive}
                className={inputClassName(false)}
              />
            </FormField>

            <FormField label="Activities" error={errors.activities}>
              <ChipInput
                items={activities}
                onChange={setActivities}
                text={activityText}
                onChangeText={setActivityText}
                placeholder="Add an activity"
              />
            </FormField>
            {errors.submit ? (
              <AppText accessibilityRole="alert" className="mt-4 text-red-600">
                {errors.submit}
              </AppText>
            ) : null}
          </ScrollView>

          {/* Buttons stay visible while the form scrolls */}
          <View className="flex-row gap-3 pt-3" style={{ paddingHorizontal: SCREEN_PADDING }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              className="flex-1 items-center rounded-full bg-gray-200 py-3.5"
            >
              <AppText className="font-sans-semibold text-base text-muted">Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={handleSave}
              accessibilityRole="button"
              className="flex-1 items-center rounded-full bg-brand-500 py-3.5"
            >
              <AppText className="font-sans-semibold text-base text-white">Save Changes</AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
