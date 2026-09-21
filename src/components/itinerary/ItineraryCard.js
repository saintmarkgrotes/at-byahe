import { Pressable, View } from 'react-native';
import { MapPin, TextCursorInput, Trash2 } from 'lucide-react-native';
import colors from '../../constants/colors';
import { cn } from '../../utils/cn';
import { AppText, Card } from '../common';

const ROW_HEIGHT = 'h-10'; // 40px per activity. The timeline line is sized from this.

// One time block: time + location on top, the activity timeline, then Delete / Edit
export default function ItineraryCard({ entry, onToggleActivity, onDelete, onEdit }) {
  return (
    <View>
      <Card className="mt-3 p-5">
        <View className="flex-row items-center justify-between gap-3">
          <AppText className="font-sans-semibold text-lg text-brand-600">{entry.time}</AppText>

          <View className="shrink flex-row items-center gap-1.5 rounded-lg bg-brand-100 px-2.5 py-1.5">
            <MapPin size={14} color={colors.brand[600]} strokeWidth={1.75} />
            <AppText className="shrink text-xs text-brand-700" numberOfLines={1}>
              {entry.location}
            </AppText>
          </View>
        </View>

        {/* Timeline: a soft strip and a thin line sit behind the dots */}
        <View className="relative ml-8 mt-4">
          <View className="absolute bottom-0 left-0 top-0 w-5 rounded-full bg-brand-100/50" />
          <View className="absolute bottom-5 left-[9.5px] top-5 w-px bg-brand-200" />

          {entry.activities.map((activity) => (
            <Pressable
              key={activity.id}
              onPress={() => onToggleActivity(entry.id, activity.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: activity.done }}
              className={cn('flex-row items-center', ROW_HEIGHT)}
            >
              <View className="w-5 items-center">
                {activity.done ? (
                  <View className="h-4 w-4 rounded-full bg-brand-500" />
                ) : (
                  <View className="h-4 w-4 rounded-full border border-brand-500 bg-white" />
                )}
              </View>

              <AppText
                className={cn(
                  'ml-4 shrink font-sans-medium text-[17px]',
                  activity.done && 'text-brand-600 line-through'
                )}
              >
                {activity.title}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View className="mt-3 flex-row justify-end gap-3">
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-full bg-red-50 px-4 py-2"
        >
          <Trash2 size={16} color="#F87171" strokeWidth={1.75} />
          <AppText className="font-sans-medium text-sm text-red-400">Delete</AppText>
        </Pressable>

        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2"
        >
          <TextCursorInput size={16} color="#3B82F6" strokeWidth={1.75} />
          <AppText className="font-sans-medium text-sm text-blue-500">Edit</AppText>
        </Pressable>
      </View>
    </View>
  );
}