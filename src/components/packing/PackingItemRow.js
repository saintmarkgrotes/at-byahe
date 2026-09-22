import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';
import { AppText, Pill } from '../common';

// Mint title band ("Essentials") with an Add pill on the right
export default function CategoryBand({ title, adding, onAddPress }) {
  return (
    <LinearGradient
      colors={[colors.mint, 'rgba(200,245,223,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <AppText variant="display" className="shrink text-brand-600">
        {title}
      </AppText>
      <Pill label={adding ? 'Close' : 'Add'} tone="brand" size="sm" onPress={onAddPress} />
    </LinearGradient>
  );
}