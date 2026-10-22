import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { AppText } from '../components/common';
import { useTrips } from '../context/TripsContext';

function TravelBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false} aria-hidden>
      <Svg width="100%" height="100%" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
        <G fill="none" stroke="#D7DDDA" strokeWidth="1.5" strokeDasharray="7 8" strokeLinecap="round">
          <Path d="M 150 -10 C 57 42 127 178 -12 213" />
          <Path d="M 330 -12 C 400 116 298 138 305 219 C 312 280 369 310 410 286" />
          <Path d="M -12 330 C 94 351 95 434 71 483" />
          <Path d="M 410 373 C 353 413 386 510 267 487" />
        </G>
        <G fill="#D7DDDA">
          <Circle cx="230" cy="25" r="3" />
          <Circle cx="250" cy="49" r="2.3" />
          <Circle cx="100" cy="130" r="4.5" />
          <Circle cx="46" cy="139" r="2.3" />
          <Circle cx="26" cy="174" r="3.5" />
          <Circle cx="365" cy="129" r="2.3" />
          <Circle cx="394" cy="235" r="2.3" />
        </G>
        <G transform="translate(320 169)">
          <Path d="M -3 36 L 36 64 L 72 0 Z" fill="#002F22" opacity="0.08" />
          <Path d="M 0 23 L 72 0 L 40 59 L 19 42 Z" fill="#00573E" />
          <Path d="M 19 42 L 72 0 L 23 45 L 22 55 Z" fill="#00966B" />
          <Path d="M 22 55 L 29 48 L 23 45 Z" fill="#007653" />
        </G>
        <G transform="translate(-26 441) rotate(-24)">
          <Rect width="83" height="139" rx="5" fill="#00815B" />
          <Path d="M 7 0 V 139" stroke="#006E4D" strokeWidth="1.5" />
          <G fill="none" stroke="#F4F7E9" strokeWidth="2">
            <Circle cx="43" cy="46" r="23" />
            <Ellipse cx="43" cy="46" rx="11" ry="23" />
            <Path d="M 20 46 H 66 M 24 34 H 62 M 24 58 H 62 M 43 23 V 69" />
          </G>
          <SvgText x="43" y="94" textAnchor="middle" fontSize="9" letterSpacing="2" fill="#F4F7E9">PASSPORT</SvgText>
        </G>
      </Svg>
    </View>
  );
}

export default function NameScreen({ onContinue }) {
  const { profile, updateProfile } = useTrips();
  const [name, setName] = useState(profile.firstName);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name to continue.');
      inputRef.current?.focus();
      return;
    }
    updateProfile(trimmedName);
    Keyboard.dismiss();
    onContinue();
  };

  return (
    <View style={styles.screen}>
      <TravelBackdrop />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 24,
              paddingLeft: insets.left + 8,
              paddingRight: insets.right + 8,
            },
          ]}
        >
          <View style={styles.brand}>
            <View accessible={false} aria-hidden>
              <Svg width="120" height="120" viewBox="0 0 120 120">
                <Defs>
                  <RadialGradient id="brandGlow" cx="50%" cy="50%" rx="70%" ry="70%">
                    <Stop offset="0" stopColor="#00AC7D" />
                    <Stop offset="1" stopColor="#007653" />
                  </RadialGradient>
                </Defs>
                <Rect width="120" height="120" rx="21" fill="url(#brandGlow)" />
              </Svg>
            </View>
            <AppText className="font-sans-bold" style={styles.brandName}>AT Byahe</AppText>
          </View>

          <View style={styles.card}>
            <AppText className="font-sans-semibold" style={styles.eyebrow}>
              INTRODUCE YOURSELF
            </AppText>
            <AppText accessibilityRole="header" className="font-sans-bold" style={styles.title}>
              Your name
            </AppText>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Your name"
              accessibilityHint="Enter the name you want to see in your greeting"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError('');
              }}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              autoCorrect={false}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              className="font-sans"
              style={[styles.input, error ? styles.inputError : null]}
            />
            {error ? (
              <AppText accessibilityRole="alert" style={styles.error}>{error}</AppText>
            ) : null}
            <AppText style={styles.hint}>You can change this later</AppText>
          </View>
        </ScrollView>
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              paddingLeft: insets.left + 8,
              paddingRight: insets.right + 8,
            },
          ]}
        >
          <View style={styles.footerCard}>
            <Pressable
              cssInterop={false}
              accessibilityRole="button"
              accessibilityHint="Saves your name and opens your travel planner"
              onPress={handleContinue}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <AppText className="font-sans-semibold" style={styles.buttonLabel}>Continue</AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFCFA' },
  keyboardContainer: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center' },
  brand: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 32,
    paddingBottom: 72,
    gap: 34,
  },
  brandName: { fontSize: 28, lineHeight: 38, color: '#007B56', textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 8,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: '#FFFFFF',
    shadowColor: '#143C2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  eyebrow: { color: '#262C29', fontSize: 12, letterSpacing: 1.5, textAlign: 'center' },
  title: { color: '#003D2B', fontSize: 38, lineHeight: 50, textAlign: 'center', marginTop: 10 },
  input: {
    marginTop: 16,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: '#ECEEEC',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#003D2B',
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: '#BD4037' },
  error: { color: '#BD4037', fontSize: 12, marginTop: 8 },
  hint: { fontSize: 12, color: '#555B57', textAlign: 'center', marginTop: 16, marginBottom: 16 },
  footer: { flexShrink: 0, alignItems: 'center', backgroundColor: '#FAFCFA' },
  footerCard: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    backgroundColor: '#FFFFFF',
  },
  button: {
    minHeight: 64,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007D59',
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonLabel: { fontSize: 23, lineHeight: 32, color: '#FFFFFF', textAlign: 'center' },
});
