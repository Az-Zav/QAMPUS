import Button from '@/components/primitives/Button';
import { useSession } from '@/hooks';
import { ButtonType, COLORS, IconSet, SPACING, TYPOGRAPHY } from '@/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const router = useRouter();
  const { signInAsStudent, signInAsGuest } = useSession();

  const handleGoogleLogin = () => {
    signInAsStudent();
    router.replace('/home');
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <View style={styles.content}>
        {/* Header Section: Logo Image + Text Brand */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../../assets/images/Qampus-Logo.png')}
            style={styles.logoMark}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>QAMPUS</Text>
            <Text style={styles.brandSubtitle}>Digital Queueing App</Text>
          </View>
        </View>

        {/* Main Body Section */}
        <View style={styles.mainContainer}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Image
              source={require('../../../assets/images/Hero_Illustration.png')}
              style={styles.heroIllustration}
              resizeMode="contain"
            />

            <View style={styles.textGroup}>
              <Text style={styles.title}>
                Skip the line,{'\n'}not the service
              </Text>
              <Text style={styles.subtitle}>
                Get started and reclaim your time.
              </Text>
            </View>
          </View>

          {/* Action Buttons & Footer */}
          <View style={styles.actionContainer}>
            <Button
              label="Continue with Google"
              type={ButtonType.SECONDARY}
              onPress={handleGoogleLogin}
              style={styles.buttonMargin}
              icon={<IconSet name="logo-google" size={20} color={COLORS.gold} />}
            />

            <Button
              label="Continue as guest"
              type={ButtonType.SECONDARY}
              onPress={handleGuestLogin}
              style={styles.buttonMargin}
              icon={<IconSet name="person-outline" size={20} color={COLORS.ink} />}
            />

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  /* Header */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  logoMark: {
    width: 44,
    height: 44,
    marginRight: SPACING.sm,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    letterSpacing: 2.5,
    lineHeight: TYPOGRAPHY.size.xl * TYPOGRAPHY.lineHeight.tight,
  },
  brandSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
  },

  /* Main Container */
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -SPACING.lg,
  },

  /* Hero */
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  heroIllustration: {
    width: '100%',
    height: 250,
    marginBottom: SPACING.sm,
  },
  textGroup: {
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxl,
    lineHeight: TYPOGRAPHY.size.xxl * TYPOGRAPHY.lineHeight.tight,
    textAlign: 'center',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.slate,
    textAlign: 'center',
  },

  /* Actions & Legal */
  actionContainer: {
    width: '100%',
    alignItems: 'stretch',
    zIndex: 10,
    elevation: 10,
  },
  buttonMargin: {
    marginBottom: SPACING.md,
  },
  termsText: {
    marginTop: SPACING.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.size.sm * TYPOGRAPHY.lineHeight.relaxed,
  },
  termsLink: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
  },
});
