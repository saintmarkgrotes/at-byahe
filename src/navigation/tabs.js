import { Backpack, CircleUserRound, ClipboardList, House } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import PackingScreen from '../screens/PackingScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Add a tab here and it shows up in the navigator and the tab bar automatically.
export const TABS = [
  { name: 'Home', label: 'Home', icon: House, component: HomeScreen },
  { name: 'Itinerary', label: 'Itinerary', icon: ClipboardList, component: ItineraryScreen },
  { name: 'Packing', label: 'Packing', icon: Backpack, component: PackingScreen },
  { name: 'Profile', label: 'Profile', icon: CircleUserRound, component: ProfileScreen },
];
