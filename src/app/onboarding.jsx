import Header from '@/components/shell/Header';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View style={styles.screen}>
      <Header title="WELCOME" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to QAMPUS</Text>
        <Text style={styles.subtitle}>Onboarding slides will be fully implemented in upcoming tasks.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    textAlign: 'center',
  },
});
