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
import { toIsoDate, formatTimeLabel } from '../../utils/date';
import { AppText } from '../common';
import ChipInput from './ChipInput';
import FormField, { inputClassName } from './FormField';
import PickerField from './PickerField';

// Adds the text still sitting in a box (not yet "Added") to the list when saving
const withPending = (items, text) => {
  const value = text.trim();
  const exists = items.some((item) => item.toLowerCase() === value.toLowerCase());
  return value && !exists ? [...items, value] : items;
};

// Bottom-sheet form for planning a new trip. Where each field ends up:
//   trips        -> destination, startDate, endDate
//   itinerary    -> location, time, activities
//   packingLists -> things to bring
export default function NewTripModal({ visible, onClose, onSubmit }) {
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(null); // Date | null
  const [endDate, setEndDate] = useState(null); // Date | null
  const [packingItems, setPackingItems] = useState([]);
  const [packingText, setPackingText] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityText, setActivityText] = useState('');
  const [activityTime, setActivityTime] = useState(null); // Date | null
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setDestination('');
    setLocation('');
    setStartDate(null);
    setEndDate(null);
    setPackingItems([]);
    setPackingText('');
    setActivities([]);
    setActivityText('');
    setActivityTime(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const finalPacking = withPending(packingItems, packingText);
    const finalActivities = withPending(activities, activityText);

    const nextErrors = {};
    if (!destination.trim()) nextErrors.destination = 'Enter where you are going.';
    if (!startDate) nextErrors.startDate = 'Pick a start date.';
    if (!endDate) nextErrors.endDate = 'Pick an end date.';
    if (startDate && endDate && toIsoDate(endDate) < toIsoDate(startDate)) {
      nextErrors.endDate = 'End date must be on or after the start date.';
    }
    if (finalActivities.length > 0 && !activityTime) {
      nextErrors.activityTime = 'Pick a start time for your activities.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      destination: destination.trim(),
      location: location.trim(),
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      packingItems: finalPacking,
      activities: finalActivities,
      activityTime: activityTime ? formatTimeLabel(activityTime) : '',
    });
    resetForm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        {/* Tap the dark area above the sheet to close */}
        <Pressable className="flex-1" onPress={handleClose} accessibilityLabel="Close" />

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
              <AppText variant="heading">New Trip</AppText>
              <AppText variant="muted">Plan your next trip</AppText>
            </View>
            <Pressable
              onPress={handleClose}
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
            <FormField label="Destination" error={errors.destination}>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Where are you going?"
                placeholderTextColor={colors.inactive}
                className={inputClassName(!!errors.destination)}
              />
            </FormField>

            <FormField label="Location (optional)" hint="Shown on your itinerary. Defaults to the destination.">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Address or area"
                placeholderTextColor={colors.inactive}
                className={inputClassName(false)}
              />
            </FormField>

            <View className="flex-row gap-3">
              <FormField label="Start date" error={errors.startDate} className="flex-1">
                <PickerField
                  mode="date"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    // Keep the end date valid if it was set before an even later start date
                    if (endDate && toIsoDate(endDate) < toIsoDate(date)) setEndDate(null);
                  }}
                  placeholder="Select date"
                  hasError={!!errors.startDate}
                />
              </FormField>
              <FormField label="End date" error={errors.endDate} className="flex-1">
                <PickerField
                  mode="date"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select date"
                  hasError={!!errors.endDate}
                  minimumDate={startDate ?? undefined}
                />
              </FormField>
            </View>

            <FormField label="Things to bring" hint="Becomes this trip's packing list.">
              <ChipInput
                items={packingItems}
                onChange={setPackingItems}
                text={packingText}
                onChangeText={setPackingText}
                placeholder="Add something to bring"
              />
            </FormField>

            <FormField label="Activities" hint="Added to Day One of your itinerary.">
              <ChipInput
                items={activities}
                onChange={setActivities}
                text={activityText}
                onChangeText={setActivityText}
                placeholder="Add an activity"
              />
            </FormField>

            <FormField label="Start time" error={errors.activityTime} hint="Needed if you add activities.">
              <PickerField
                mode="time"
                value={activityTime}
                onChange={setActivityTime}
                placeholder="Select time"
                hasError={!!errors.activityTime}
              />
            </FormField>
          </ScrollView>

          {/* Buttons stay visible while the form scrolls */}
          <View className="flex-row gap-3 pt-3" style={{ paddingHorizontal: SCREEN_PADDING }}>
            <Pressable
              onPress={handleClose}
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
              <AppText className="font-sans-semibold text-base text-white">Save Trip</AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}