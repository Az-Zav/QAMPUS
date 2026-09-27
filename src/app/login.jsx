import React from 'react';
import { StyleSheet, View, Text, Image, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/primitives/Button';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';

export default function Login() {
    return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.paper} />
      
      <View style={styles.content}>
        {/* Header Section: Logo Image + Text Brand */}
        <View style={styles.headerContainer}>
            <Image
                source={require('../../assets/images/Qampus-Logo.png')}
                style={styles.logoMark}
                resizeMode="contain"
            />
            <View style={styles.brandTextGroup}>
                <Text style={styles.brandTitle}>QAMPUS</Text>
                <Text style={styles.brandSubtitle}>Digital Queueing App</Text>
            </View>
        </View>
        {/* Main Body Section (Groups Hero + Actions together) */}
            <View style={styles.mainContainer}>
            {/* Hero Section: Large Illustration + Main Value Props */}
            <View style={styles.heroContainer}>
                <Image
                    source={require('../../assets/images/Hero_Illustration.png')}
                    style={styles.heroIllustration}
                    resizeMode="contain"
                />

                <View style={styles.textGroup}>
                    <Text style={styles.title}>
                    Skip the line,{"\n"}not the service
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
                    onPress={() => {
                    // Handle Google Sign-In
                    }}
                    style={styles.buttonMargin}
                    icon={<theme.IconSet name="logo-google" size={20} color={theme.colors.gold} />}
                />

                <Button
                    label="Continue as guest"
                    type={ButtonType.SECONDARY}
                    onPress={() => {
                    // Handle Guest Navigation
                    }}
                    style={styles.buttonMargin}
                    icon={<theme.IconSet name="person-outline" size={20} color={theme.colors.ink} />}
                />

                <Text style={styles.termsText}>
                        By continuing you agree to our{' '}
                    <Text style={styles.termsLink} onPress={() => {/* Navigate to Terms */}}>
                        Terms
                    </Text>{' '}
                        &{' '}
                    <Text style={styles.termsLink} onPress={() => {/* Navigate to Privacy */}}>
                    Privacy Policy
                    </Text>
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
    backgroundColor: theme.colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  /* Header */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  logoMark: {
    width: 44,
    height: 44,
    marginRight: theme.spacing.sm,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
    color: theme.colors.ink,
    letterSpacing: 2.5,
    lineHeight: theme.typography.size.xl * theme.typography.lineHeight.tight,
  },
  brandSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    color: theme.colors.slate,
  },

  /* Main Container — Pulls body content up toward header */
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -theme.spacing.lg,
  },

  /* Hero */
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  heroIllustration: {
    width: '100%',
    height: 250,
    marginBottom: theme.spacing.sm,
  },
  textGroup: {
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xxl,
    lineHeight: theme.typography.size.xxl * theme.typography.lineHeight.tight,
    textAlign: 'center',
    color: theme.colors.ink,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base,
    color: theme.colors.slate,
    textAlign: 'center',
  },

  /* Actions & Legal */
  actionContainer: {
    width: '100%',
    alignItems: 'stretch',
    zIndex: 10,
    elevation: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonMargin: {
    marginBottom: theme.spacing.md,
  },
  termsText: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.slate,
    textAlign: 'center',
    lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
  },
  termsLink: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
  },
});