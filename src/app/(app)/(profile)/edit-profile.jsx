import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/primitives/Button';
import Input from '@/components/primitives/Input';
import Picker from '@/components/primitives/Picker';
import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';

import {
  COLORS, EDIT_PROFILE_COPY, GUEST_TYPE_LABEL, IconSet, InputType, PROGRAM_OPTIONS, SPACING, TYPOGRAPHY, USER_ROLE,
} from '@/constants';
import { useSession } from '@/hooks';

// S14 Edit Profile (UIUX §4.12). Students edit program only — student ID changes go
// through the Super Admin (PRD R-01). Guests edit name, email, guest type; Guest ID is read-only (R-02).

const COPY = EDIT_PROFILE_COPY;
const NAME_MAX = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Picker works on display strings; map guest-type labels back to enum keys
const GUEST_TYPE_OPTIONS = Object.values(GUEST_TYPE_LABEL);
const guestTypeFromLabel = (label) => Object.keys(GUEST_TYPE_LABEL).find((key) => GUEST_TYPE_LABEL[key] === label) ?? null;

function initialForm(user) {
  return {
    program: user.program ?? null,
    name: user.name ?? '',
    email: user.email ?? '',
    guest_type: user.guest_type ?? null,
  };
}

function validate(form, isGuest) {
  const errors = {};
  if (isGuest) {
    if (!form.name.trim()) errors.name = COPY.errors.nameRequired;
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) errors.email = COPY.errors.emailInvalid;
    if (!form.guest_type) errors.guest_type = COPY.errors.guestTypeRequired;
  } else if (!form.program) {
    errors.program = COPY.errors.programRequired;
  }
  return errors;
}

// Only the fields the role may change are sent
function toChanges(form, isGuest) {
  if (!isGuest) return { program: form.program };
  return {
    name: form.name.trim(),
    email: form.email.trim() || null,
    guest_type: form.guest_type,
  };
}

function Field({ label, hint, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {!!error && (
        <View style={styles.messageRow}>
          <IconSet name="alert-circle" size={14} color={COLORS.error} />
          <Text style={[styles.message, styles.error]} accessibilityLiveRegion="polite">{error}</Text>
        </View>
      )}
      {!error && !!hint && <Text style={styles.message}>{hint}</Text>}
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useSession();
  const [form, setForm] = useState(() => (user ? initialForm(user) : null));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!user) return <Redirect href="/login" />;

  const isGuest = user.role === USER_ROLE.GUEST;
  const initial = initialForm(user);
  const dirty = Object.keys(initial).some((key) => initial[key] !== form[key]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear a field's error as soon as the user touches it
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const save = async () => {
    const nextErrors = validate(form, isGuest);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await updateProfile(toChanges(form, isGuest));
      goBack();
    } catch {
      setSubmitError(COPY.errors.saveFailed);
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SubHeader title={COPY.title} onBack={goBack} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <SectionLabel text={COPY.accountLabel} />
            <Field
              label={isGuest ? COPY.guestIdLabel : COPY.studentIdLabel}
              hint={isGuest ? COPY.guestIdHint : COPY.studentIdHint}
            >
              <Input value={user.institutional_id} disabled accessibilityLabel={isGuest ? COPY.guestIdLabel : COPY.studentIdLabel} />
            </Field>
          </View>

          <View style={styles.section}>
            <SectionLabel text={COPY.detailsLabel} />
            {isGuest ? (
              <>
                <Field label={COPY.nameLabel} error={errors.name}>
                  <Input
                    value={form.name}
                    onChangeText={(v) => setField('name', v)}
                    placeholder={COPY.namePlaceholder}
                    type={errors.name ? InputType.ERROR : InputType.DEFAULT}
                    maxLength={NAME_MAX}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    disabled={saving}
                    accessibilityLabel={COPY.nameLabel}
                  />
                </Field>
                <Field label={COPY.emailLabel} error={errors.email}>
                  <Input
                    value={form.email}
                    onChangeText={(v) => setField('email', v)}
                    placeholder={COPY.emailPlaceholder}
                    type={errors.email ? InputType.ERROR : InputType.DEFAULT}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    disabled={saving}
                    accessibilityLabel={COPY.emailLabel}
                  />
                </Field>
                <Field label={COPY.guestTypeLabel} error={errors.guest_type}>
                  <Picker
                    value={GUEST_TYPE_LABEL[form.guest_type] ?? null}
                    onSelect={(label) => setField('guest_type', guestTypeFromLabel(label))}
                    options={GUEST_TYPE_OPTIONS}
                    placeholder={COPY.guestTypePlaceholder}
                    style={errors.guest_type && styles.pickerError}
                  />
                </Field>
              </>
            ) : (
              <Field label={COPY.programLabel} error={errors.program}>
                <Picker
                  value={form.program}
                  onSelect={(v) => setField('program', v)}
                  options={PROGRAM_OPTIONS}
                  placeholder={COPY.programPlaceholder}
                  searchable
                  style={errors.program && styles.pickerError}
                />
              </Field>
            )}
          </View>

          {!!submitError && <Text style={[styles.message, styles.error, styles.submitError]}>{submitError}</Text>}

          <Button
            label={saving ? COPY.saving : COPY.save}
            onPress={save}
            disabled={!dirty || saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  flex: { flex: 1 },
  content: {
    gap: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  section: { gap: SPACING.md },
  field: { gap: SPACING.xs },
  fieldLabel: {
    paddingHorizontal: SPACING.xxs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.ink,
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs, paddingHorizontal: SPACING.xxs },
  message: {
    paddingHorizontal: SPACING.xxs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
  },
  error: { paddingHorizontal: 0, color: COLORS.error },
  submitError: { textAlign: 'center' },
  pickerError: { borderWidth: 2, borderColor: COLORS.error },
});
