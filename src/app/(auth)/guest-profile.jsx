import Button from '@/components/primitives/Button';
import FormField from '@/components/primitives/FormField';
import Input from '@/components/primitives/Input';
import Picker from '@/components/primitives/Picker';
import { GUEST_TYPE_LABEL, IconSet, InputType, lineHeightFor, PROFILE_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';
import { isValidEmail } from '@/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COPY = PROFILE_COPY.guest;
const ISSUED_COPY = PROFILE_COPY.guestIssued;

// Picker works with labels; map back to GUEST_TYPE keys for storage
const GUEST_TYPE_OPTIONS = Object.values(GUEST_TYPE_LABEL);
const guestTypeFromLabel = (label) =>
  Object.keys(GUEST_TYPE_LABEL).find((key) => GUEST_TYPE_LABEL[key] === label) ?? null;

// S06: guest profile form, then the issued Guest ID (R-02). Exit -> Home.
export default function GuestProfileScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { completeGuestProfile } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guestType, setGuestType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [guestId, setGuestId] = useState(null); // set once the (mock) backend issues it

  const emailInvalid = email.trim() !== '' && !isValidEmail(email);
  const nameError = submitted && !name.trim() ? COPY.nameError : null;
  const emailError = submitted && emailInvalid ? COPY.emailError : null;
  const guestTypeError = submitted && !guestType ? COPY.guestTypeError : null;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!name.trim() || emailInvalid || !guestType) return;
    setGuestId(completeGuestProfile({ name: name.trim(), email: email.trim(), guestType }));
  };

  if (guestId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.issued}>
          <IconSet name="checkmark-circle-outline" size={44} color={colors.success} />
          <Text style={styles.issuedTitle} accessibilityRole="header">
            {ISSUED_COPY.title}
          </Text>
          <Text style={styles.guestId} selectable>
            {guestId}
          </Text>
          <Text style={[styles.body, styles.center]}>{ISSUED_COPY.body}</Text>
        </View>
        <View style={styles.footer}>
          <Button label={PROFILE_COPY.continue} onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.title} accessibilityRole="header">
              {COPY.title}
            </Text>
            <Text style={styles.body}>{COPY.intro}</Text>
          </View>

          <FormField label={COPY.nameLabel} error={nameError}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={COPY.namePlaceholder}
              autoCapitalize="words"
              autoComplete="name"
              type={nameError ? InputType.ERROR : InputType.DEFAULT}
            />
          </FormField>

          <FormField label={COPY.emailLabel} helper={COPY.emailHelper} error={emailError}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder={COPY.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              type={emailError ? InputType.ERROR : InputType.DEFAULT}
            />
          </FormField>

          <FormField label={COPY.guestTypeLabel} error={guestTypeError}>
            <Picker
              value={guestType ? GUEST_TYPE_LABEL[guestType] : null}
              onSelect={(label) => setGuestType(guestTypeFromLabel(label))}
              options={GUEST_TYPE_OPTIONS}
              placeholder={COPY.guestTypePlaceholder}
            />
          </FormField>
        </ScrollView>

        <View style={styles.footer}>
          <Button label={PROFILE_COPY.continue} onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.paper,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg, // space between fields
  },
  intro: {
    gap: SPACING.xs,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxl,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xxl, TYPOGRAPHY.lineHeight.tight),
    color: c.ink,
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm, TYPOGRAPHY.lineHeight.relaxed),
    color: c.slate,
  },
  center: {
    textAlign: 'center',
  },
  issued: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
  },
  issuedTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: c.ink,
  },
  guestId: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: 2,
    color: c.ink,
  },
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
});