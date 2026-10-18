import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { AppText } from '../components/common';

function TravelPaths() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false} aria-hidden>
      <Svg width="100%" height="100%" viewBox="0 0 944 2048" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="travelPath" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#31D8AA" stopOpacity="0.45" />
            <Stop offset="0.55" stopColor="#20C79C" stopOpacity="0.08" />
            <Stop offset="1" stopColor="#002E23" stopOpacity="0.5" />
          </SvgGradient>
        </Defs>
        <G fill="none" stroke="url(#travelPath)" strokeWidth="4" strokeDasharray="16 17" strokeLinecap="round">
          <Path d="M 379 -10 C 363 175 533 297 723 289 C 827 288 898 250 962 194" />
          <Path d="M 448 460 C 314 458 187 526 162 656 C 137 781 114 865 55 965" />
          <Path d="M 345 641 C 258 743 393 831 380 951" />
          <Path d="M 621 498 C 731 571 772 750 708 869 C 648 993 700 1120 832 1171 C 893 1194 937 1181 965 1150" />
          <Path d="M 928 889 C 799 970 736 1157 785 1316 C 833 1467 754 1528 658 1558" />
          <Path d="M -8 1335 C 83 1390 124 1504 105 1602" />
        </G>
        <G fill="#20DBAD">
          <Circle cx="156" cy="70" r="11" opacity="0.55" />
          <Circle cx="385" cy="232" r="8" opacity="0.5" />
          <Circle cx="872" cy="485" r="11" opacity="0.4" />
          <Circle cx="791" cy="501" r="9" opacity="0.4" />
          <Circle cx="473" cy="566" r="8" opacity="0.3" />
          <Circle cx="520" cy="623" r="6" opacity="0.3" />
          <Circle cx="167" cy="814" r="11" opacity="0.16" />
          <Circle cx="38" cy="836" r="6" opacity="0.12" />
          <Circle cx="790" cy="813" r="6" opacity="0.12" />
        </G>
      </Svg>
    </View>
  );
}

export default function GetStartedScreen({ onGetStarted }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <LinearGradient
      colors={['#00A779', '#00976C', '#006547', '#003C2B']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.screen}
    >
      <TravelPaths />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom + 24, height * 0.07),
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.actions, { gap: Math.min(80, height * 0.075) }]}>
          <AppText
            accessibilityRole="header"
            className="font-sans-bold text-white"
            style={styles.welcome}
          >
            Welcome!
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens your travel planner"
            onPress={onGetStarted}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <AppText className="font-sans-bold" style={styles.buttonLabel}>
              Get Started
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#003C2B',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
  },
  button: {
    width: '76%',
    maxWidth: 360,
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFFFE',
    shadowColor: '#001F16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    color: '#00845E',
    fontSize: 25,
    lineHeight: 34,
    textAlign: 'center',
  },
});
