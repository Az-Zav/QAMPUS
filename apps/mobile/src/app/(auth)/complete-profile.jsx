import { Button, FormField, Input } from '@qampus/ui';
import Picker from '@/components/primitives/Picker';
import { InputType, lineHeightFor, PROFILE_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { usePrograms, useSession, useThemedStyles } from '@/hooks';
import { isValidStudentId } from '@/utils';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';


const COPY = PROFILE_COPY.student;

// S05: first Google sign-in collects student ID + program (R-01). Exit -> Home.
export default function CompleteProfileScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const {user, completeStudentProfile } = useSession();
  const { programs } = usePrograms();

  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [idTaken, setIdTaken] = useState(false); // another account registered this student ID first
  
  // Already filled in: nothing to collect (R-01 locks the student ID after first entry)
  if (user?.institutional_id && user?.program) return <Redirect href="/home" />;


  // Errors show only after the first Continue press
  const studentIdError = idTaken
    ? COPY.studentIdTaken
    : submitted && !isValidStudentId(studentId)
      ? COPY.studentIdError
      : null;
  const programError = submitted && !program ? COPY.programError : null;

  const handleContinue = async () => {
    setSubmitted(true);
    if (!isValidStudentId(studentId) || !program) return;
    setIdTaken(false);
    try {
      await completeStudentProfile({ studentId: studentId.trim(), program });
      router.replace('/home');
    } catch (error) {
      if (error.code === 'ID_TAKEN') {
        setIdTaken(true);
        return;
      }
      // TODO: swap Alert for NoticeModal once error copy exists
      console.warn('Saving profile failed', error);
      Alert.alert('Could not save', 'Check your connection and try again.');
    }
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
              onChangeText={(text) => {
                setStudentId(text.replace(/\D/g, ''));
                setIdTaken(false);
              }}
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