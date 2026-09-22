import { cn } from '../../utils/cn';
import AppText from './AppText';
import Card from './Card';
import Pill from './Pill';

// Friendly box shown when a screen has no data yet. The button is optional.
export default function EmptyState({ title, message, actionLabel, onActionPress, className }) {
  return (
    <Card className={cn('items-center px-6 py-8', className)}>
      <AppText variant="heading" className="text-center">
        {title}
      </AppText>
      <AppText variant="muted" className="mt-1 text-center">
        {message}
      </AppText>
      {actionLabel ? (
        <Pill
          label={actionLabel}
          tone="brand"
          size="md"
          onPress={onActionPress}
          className="mt-4 self-center"
        />
      ) : null}
    </Card>
  );
}