import { Text } from 'react-native';
import { cn } from '../../utils/cn';

// Every piece of text in the app goes through here so fonts and colors stay consistent.
const VARIANTS = {
  display: 'font-sans-extrabold text-[34px] leading-[40px] text-ink',
  heading: 'font-sans-semibold text-2xl text-brand-600',
  subheading: 'font-sans-semibold text-base text-brand-600',
  body: 'font-sans text-base text-ink',
  muted: 'font-sans text-sm text-muted',
  caption: 'font-sans text-xs text-muted',
};

export default function AppText({ variant = 'body', className, children, ...props }) {
  return (
    <Text className={cn(VARIANTS[variant], className)} {...props}>
      {children}
    </Text>
  );
}
