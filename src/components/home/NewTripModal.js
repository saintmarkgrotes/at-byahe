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
import { isValidIsoDate } from '../../utils/date';
import { AppText } from '../common';
import ChipInput from './ChipInput';
import FormField, { inputClassName } from './FormField';

// Adds the text still sitting in a box (not yet "Added") to the list when saving
const withPending = (items, text) => {
  const value = text.trim();
  const exists = items.some((item) => item.toLowerCase() === value.toLowerCase());
  return value && !exists ? [...items, value] : items;
};

// Bottom-sheet form for planning a new trip. Fields follow mockData:
//   trips        -> destination, startDate, endDate
//   itinerary    -> location, time, activities
//   packingLists -> things to bring
export default function NewTripModal({ visible, onClose, onSubmit }) {
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [packingItems, setPackingItems] = useState([]);
  const [packingText, setPackingText] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityText, setActivityText] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setDestination('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setPackingItems([]);
    setPackingText('');
    setActivities([]);
    setActivityText('');
    setActivityTime('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const finalPacking = withPending(packingItems, packingText);
    const finalActivities = withPending(activities, activityText);
    const start = startDate.trim();
    const end = endDate.trim();
    const time = activityTime.trim();

    const nextErrors = {};
    if (!destination.trim()) nextErrors.destination = 'Enter where you are going.';
    if (!isValidIsoDate(start)) nextErrors.startDate = 'Use YYYY-MM-DD, e.g. 2026-09-19.';
    if (!isValidIsoDate(end)) nextErrors.endDate = 'Use YYYY-MM-DD, e.g. 2026-09-23.';
    if (!nextErrors.startDate && !nextErrors.endDate && end < start) {
      nextErrors.endDate = 'End date must be on or after the start date.';
    }
    if (finalActivities.length > 0 && !time) {
      nextErrors.activityTime = 'Add a start time for your activities, e.g. 8:30 AM.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      destination: destination.trim(),
      location: location.trim(),
      startDate: start,
      endDate: end,
      packingItems: finalPacking,
      activities: finalActivities,
      activityTime: time,
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
                placeholder="e.g. Boracay Island"
                placeholderTextColor={colors.inactive}
                className={inputClassName(!!errors.destination)}
              />
            </FormField>

            <FormField label="Location (optional)" hint="Shown on your itinerary. Defaults to the destination.">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Boracay Island, Malay, Aklan"
                placeholderTextColor={colors.inactive}
                className={inputClassName(false)}
              />
            </FormField>

            <View className="flex-row gap-3">
              <FormField label="Start date" error={errors.startDate} className="flex-1">
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.inactive}
                  keyboardType="numbers-and-punctuation"
                  className={inputClassName(!!errors.startDate)}
                />
              </FormField>
              <FormField label="End date" error={errors.endDate} className="flex-1">
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.inactive}
                  keyboardType="numbers-and-punctuation"
                  className={inputClassName(!!errors.endDate)}
                />
              </FormField>
            </View>

            <FormField label="Things to bring" hint="Becomes this trip's packing list.">
              <ChipInput
                items={packingItems}
                onChange={setPackingItems}
                text={packingText}
                onChangeText={setPackingText}
                placeholder="e.g. Sunscreen"
              />
            </FormField>

            <FormField label="Activities" hint="Added to Day One of your itinerary.">
              <ChipInput
                items={activities}
                onChange={setActivities}
                text={activityText}
                onChangeText={setActivityText}
                placeholder="e.g. Island Hoping"
              />
            </FormField>

            <FormField label="Start time" error={errors.activityTime} hint="Needed if you add activities.">
              <TextInput
                value={activityTime}
                onChangeText={setActivityTime}
                placeholder="e.g. 8:30 AM"
                placeholderTextColor={colors.inactive}
                className={inputClassName(!!errors.activityTime)}
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