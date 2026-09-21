import { Pressable, View } from 'react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import AppText from './AppText';

const SIZES = {
  sm: { box: 'gap-1.5 px-3 py-1.5', text: 'text-xs', icon: 14 },
  md: { box: 'gap-2 px-4 py-2.5', text: 'text-base', icon: 22 },
};

const TONES = {
  brand: { text: 'text-brand-600', icon: colors.brand[600] },
  neutral: { text: 'text-ink', icon: colors.ink },
};

// Small rounded label with an optional icon. Used for badges, chips and quick actions.
export default function Pill({
  icon: Icon,
  label,
  size = 'sm',
  tone = 'neutral',
  onPress,
  className,
}) {
  const s = SIZES[size];
  const t = TONES[tone];
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className={cn(
        'flex-row items-center self-start rounded-full bg-white shadow-md shadow-black/10',
        s.box,
        className
      )}
    >
      {Icon ? <Icon size={s.icon} color={t.icon} strokeWidth={1.75} /> : null}
      <AppText variant="body" className={cn('font-sans-medium', s.text, t.text)}>
        {label}
      </AppText>
    </Wrapper>
  );
}
