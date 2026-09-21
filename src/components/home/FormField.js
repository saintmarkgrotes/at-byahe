import { View } from 'react-native';
import { cn } from '../../utils/cn';
import { AppText } from '../common';

// Style for every text box in the New Trip form (red border when it has an error)
export const inputClassName = (hasError) =>
  cn(
    'rounded-2xl border bg-brand-50 px-4 py-3 font-sans text-base text-ink',
    hasError ? 'border-red-300' : 'border-brand-100'
  );

// A label above an input, with an optional hint or error message below it
export default function FormField({ label, hint, error, className, children }) {
  return (
    <View className={cn('mt-5', className)}>
      <AppText className="mb-2 font-sans-semibold text-sm">{label}</AppText>
      {children}
      {error ? (
        <AppText className="mt-1 text-xs text-red-500">{error}</AppText>
      ) : hint ? (
        <AppText variant="caption" className="mt-1">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}