import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FloatingTabBar } from '../components/navigation';
import { TABS } from './tabs';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        {TABS.map(({ name, label, icon, component }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{ tabBarLabel: label, tabBarIcon: icon }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
