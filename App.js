import './global.css';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import AppNavigator from './src/navigation/AppNavigator';
import GetStartedScreen from './src/screens/GetStartedScreen';
import NameScreen from './src/screens/NameScreen';
import { TripsProvider } from './src/context/TripsContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [step, setStep] = useState('welcome');
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={step === 'welcome' ? 'light' : 'dark'} />
      <TripsProvider>
        {step === 'home' ? (
          <AppNavigator />
        ) : step === 'name' ? (
          <NameScreen onContinue={() => setStep('home')} />
        ) : (
          <GetStartedScreen onGetStarted={() => setStep('name')} />
        )}
      </TripsProvider>
    </SafeAreaProvider>
  );
}
