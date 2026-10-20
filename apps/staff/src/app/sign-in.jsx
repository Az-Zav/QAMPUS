import { RADII, SIGN_IN_COPY, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useSession, useThemedStyles } from '@/hooks';
import { ShieldCheck, Timer, UserRoundCheck } from '@/icons';
import { SignInStatus } from '@/providers/SessionProvider';
import { Button } from '@qampus/ui';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const HIGHLIGHT_ICONS = { timer: Timer, userCheck: UserRoundCheck, shield: ShieldCheck };
const SPLIT_BREAKPOINT = 960;

// W01 — Sign in (+ Loading, Error)
export default function SignIn() {
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const { signIn, signInStatus } = useSession();
  // Dev aid until real auth: /sign-in?as=unassigned signs in an account with no office
  const { as } = useLocalSearchParams();
  const loading = signInStatus === SignInStatus.LOADING;

  return (
    <View style={styles.screen}>
      {width >= SPLIT_BREAKPOINT && (
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <Image source={require('../../assets/images/Qampus-Logo.png')} style={styles.logo} contentFit="contain" />
            <Text style={styles.headline}>{SIGN_IN_COPY.headline}</Text>
            <Text style={styles.heroBody}>{SIGN_IN_COPY.body}</Text>
            <View style={styles.highlights}>
              {SIGN_IN_COPY.highlights.map(({ icon, text }) => {
                const Icon = HIGHLIGHT_ICONS[icon];
                return (
                  <View key={text} style={styles.highlight}>
                    <Icon size={16} color={styles.highlightIcon.color} />
                    <Text style={styles.highlightText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.card}>
          <Text style={styles.title}>{SIGN_IN_COPY.title}</Text>
          <Text style={styles.subtitle}>{SIGN_IN_COPY.subtitle}</Text>
          {signInStatus === SignInStatus.ERROR && <Text style={styles.error}>{SIGN_IN_COPY.error}</Text>}
          <Button
            label={loading ? SIGN_IN_COPY.ctaLoading : SIGN_IN_COPY.cta}
            disabled={loading}
            onPress={() => signIn({ variant: as })}
            style={styles.cta}
          />
          <Text style={styles.footnote}>{SIGN_IN_COPY.footnote}</Text>
        </View>
      </View>
    </View>
  );
}

// The hero is always dark (Figma W01), independent of the color scheme
const HERO_BG = '#0A0A0A';
const HERO_TEXT = '#FAF7F0';

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, flexDirection: 'row', backgroundColor: c.paper },
    hero: { flex: 11, backgroundColor: HERO_BG, justifyContent: 'center', alignItems: 'flex-end' },
    heroInner: { width: '100%', maxWidth: 480, paddingHorizontal: SPACING.huge, gap: SPACING.xxl },
    logo: { width: 52, height: 44 },
    headline: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.size.display,
      lineHeight: 40,
      color: HERO_TEXT,
    },
    heroBody: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 22,
      color: withOpacity(HERO_TEXT, 0.8),
    },
    highlights: { gap: SPACING.md },
    highlight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    highlightIcon: { color: c.gold },
    highlightText: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.base,
      color: withOpacity(HERO_TEXT, 0.8),
    },
    panel: { flex: 13, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    card: { width: '100%', maxWidth: 360, alignItems: 'center', gap: SPACING.md },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.xxl, color: c.ink },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.base, color: c.slate },
    error: {
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.error,
      textAlign: 'center',
      backgroundColor: withOpacity(c.error, 0.1),
      padding: SPACING.md,
      borderRadius: RADII.md,
    },
    cta: { alignSelf: 'stretch', borderRadius: RADII.full, marginTop: SPACING.sm },
    footnote: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.xs,
      lineHeight: 16,
      color: c.slate,
      textAlign: 'center',
    },
  });
