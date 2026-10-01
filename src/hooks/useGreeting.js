import { useTrips } from '../context/TripsContext';
export default function useGreeting() {
  const { now } = useTrips();
  const hour = now.getHours();
  return hour < 12 ? 'Good Morning!' : hour < 18 ? 'Good Afternoon!' : 'Good Evening!';
}
