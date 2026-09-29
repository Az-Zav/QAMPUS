import Button from '@/components/primitives/Button';
import Input from '@/components/primitives/Input';
import Header from '@/components/shell/Header';
import { ButtonType, COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GuestProfileScreen() {
  const { user, actions } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [purpose, setPurpose] = useState(user?.purpose || '');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    setErrorMsg(null);
    const res = await actions.completeGuestProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      purpose: purpose.trim(),
    });
    if (!res.ok) {
      setErrorMsg(res.message || 'Failed to submit guest details');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="GUEST PROFILE" />
      <View style={styles.content}>
        <Text style={styles.title}>Guest Details</Text>
        <Text style={styles.subtitle}>Provide your basic info to receive queue updates.</Text>

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <Input value={name} onChangeText={setName} placeholder="Your name" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Phone Number</Text>
          <Input value={phone} onChangeText={setPhone} placeholder="0917-000-0000" keyboardType="phone-pad" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Input value={email} onChangeText={setEmail} placeholder="guest@example.com" keyboardType="email-address" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Purpose of Visit</Text>
          <Input value={purpose} onChangeText={setPurpose} placeholder="Inquiry, Submission, etc." />
        </View>

        <Button
          label="Continue to App"
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
    marginBottom: SPACING.md,
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
