import Button from '@/components/primitives/Button';
import Input from '@/components/primitives/Input';
import Header from '@/components/shell/Header';
import { ButtonType, COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CompleteProfileScreen() {
  const { user, actions } = useAuth();
  const [institutionalId, setInstitutionalId] = useState(user?.institutionalId || '');
  const [program, setProgram] = useState(user?.program || '');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSave = async () => {
    if (!institutionalId.trim()) {
      setErrorMsg('Student ID is required');
      return;
    }
    setErrorMsg(null);
    const res = await actions.completeStudentProfile({
      institutionalId: institutionalId.trim(),
      program: program.trim(),
    });
    if (!res.ok) {
      setErrorMsg(res.message || 'Failed to complete profile');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="COMPLETE PROFILE" />
      <View style={styles.content}>
        <Text style={styles.title}>Student Verification</Text>
        <Text style={styles.subtitle}>Enter your institutional details to access campus queueing services.</Text>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Student ID / Institutional ID *</Text>
          <Input
            value={institutionalId}
            onChangeText={setInstitutionalId}
            placeholder="e.g. 2024-10042"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Degree Program / Course</Text>
          <Input
            value={program}
            onChangeText={setProgram}
            placeholder="e.g. BS Computer Science"
          />
        </View>

        <Button
          label="Save & Continue"
          type={ButtonType.PRIMARY}
          onPress={handleSave}
          style={styles.button}
        />
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
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  button: {
    marginTop: SPACING.md,
  },
});
