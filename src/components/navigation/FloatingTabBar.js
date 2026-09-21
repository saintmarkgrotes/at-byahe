import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_PADDING } from '../../constants/layout';
import TabBarItem from './TabBarItem';

// Custom `tabBar` for React Navigation's bottom tabs: a floating white pill.
// Icon and label come from each screen's `options` in src/navigation/tabs.js.
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0"
      style={{ bottom: Math.max(insets.bottom, 12), paddingHorizontal: SCREEN_PADDING }}
    >
      <View className="flex-row rounded-full border border-brand-100 bg-white px-3 py-3 shadow-lg shadow-black/10">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabBarItem
              key={route.key}
              icon={options.tabBarIcon}
              label={options.tabBarLabel ?? route.name}
              focused={focused}
              onPress={handlePress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}
