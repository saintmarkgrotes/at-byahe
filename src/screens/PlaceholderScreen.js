import { View } from 'react-native';
import { AppText } from '../components/common';

// Shared stand-in until each tab gets its real screen
export default function PlaceholderScreen({ title }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted">Coming soon</AppText>
    </View>
  );
}
