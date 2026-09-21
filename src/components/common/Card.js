import { Pressable, View } from 'react-native';
import { cn } from '../../utils/cn';

// White rounded surface. Becomes pressable when `onPress` is passed.
export default function Card({ onPress, className, children, ...props }) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className={cn(
        'rounded-3xl border border-brand-100 bg-white shadow-md shadow-black/10',
        onPress && 'active:opacity-90',
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  );
}
