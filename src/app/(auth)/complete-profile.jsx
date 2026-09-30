import Button from '@/components/primitives/Button';
import FormField from '@/components/primitives/FormField';
import Input from '@/components/primitives/Input';
import Picker from '@/components/primitives/Picker';
import { InputType, lineHeightFor, PROFILE_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { usePrograms, useSession, useThemedStyles } from '@/hooks';
import { isValidStudentId } from '@/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COPY = PROFILE_COPY.student;

// S05: first Google sign-in collects student ID + program (R-01). Exit -> Home.
export default function CompleteProfileScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { completeStudentProfile } = useSession();
  const { programs } = usePrograms();

  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Errors show only after the first Continue press
  const studentIdError = submitted && !isValidStudentId(studentId) ? COPY.studentIdError : null;
  const programError = submitted && !program ? COPY.programError : null;

  const handleContinue = () => {
    setSubmitted(true);
    if (!isValidStudentId(studentId) || !program) return;
    completeStudentProfile({ studentId: studentId.trim(), program });
    router.replace('/home');
  };

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

          <FormField label={COPY.studentIdLabel} helper={COPY.studentIdHelper} error={studentIdError}>
            <Input
              value={studentId}
              onChangeText={(text) => setStudentId(text.replace(/\D/g, ''))}
              placeholder={COPY.studentIdPlaceholder}
              keyboardType="number-pad"
              maxLength={7}
              type={studentIdError ? InputType.ERROR : InputType.DEFAULT}
            />
          </FormField>

          <FormField label={COPY.programLabel} error={programError}>
            <Picker
              value={program}
              onSelect={setProgram}
              options={programs}
              placeholder={COPY.programPlaceholder}
              searchable
            />
          </FormField>
        </ScrollView>

        <View style={styles.footer}>
          <Button label={PROFILE_COPY.continue} onPress={handleContinue} />
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
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
});