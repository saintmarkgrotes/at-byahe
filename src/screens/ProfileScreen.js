import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/common';
import { useTrips } from '../context/TripsContext';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '../constants/layout';
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, trips, saving, saveError } = useTrips();
  return (
    <ScrollView
      className="flex-1 bg-white"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: insets.top + 24,
        paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
      }}
    >
      <AppText variant="heading">Profile</AppText>
      <AppText variant="muted" className="mt-2">
        Make this travel planner yours.
      </AppText>
      <View className="mt-8">
        <AppText variant="subheading">First name</AppText>
        <TextInput
          accessibilityLabel="First name"
          value={profile.firstName}
          onChangeText={updateProfile}
          maxLength={80}
          autoCapitalize="words"
          placeholder="Your name"
          className="mt-3 rounded-2xl border border-gray-200 p-4 font-sans text-base text-ink"
        />
        <AppText variant="caption" className="mt-2">
          {saveError
            ? 'Not saved. Use Retry saving above.'
            : saving
              ? 'Saving...'
              : 'Saved on this device'}
        </AppText>
      </View>
      <View className="mt-8 rounded-2xl bg-brand-100 p-5">
        <AppText variant="subheading">Your offline planner</AppText>
        <AppText className="mt-2">
          {trips.length} saved trip{trips.length === 1 ? '' : 's'}
        </AppText>
        <AppText variant="muted" className="mt-2">
          Trips, notes, and packing lists stay on this device. No account is needed. Clearing app
          data or uninstalling removes them; they do not sync to other devices.
        </AppText>
      </View>
    </ScrollView>
  );
}
