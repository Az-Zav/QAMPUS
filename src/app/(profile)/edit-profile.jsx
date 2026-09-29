import Button from '@/components/primitives/Button';
import Input from '@/components/primitives/Input';
import Header from '@/components/shell/Header';
import { ButtonType, COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, actions } = useAuth();

  const isGuest = user?.role === 'GUEST';

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [institutionalId, setInstitutionalId] = useState(user?.institutionalId || '');
  const [program, setProgram] = useState(user?.program || '');
  const [msg, setMsg] = useState(null);

  const handleSave = async () => {
    let res;
    if (isGuest) {
      res = await actions.completeGuestProfile({ name, email, phone, purpose: user?.purpose });
    } else {
      res = await actions.completeStudentProfile({ institutionalId, program });
    }
    if (res.ok) {
      setMsg({ success: true, text: 'Profile saved successfully!' });
      setTimeout(() => router.back(), 1000);
    } else {
      setMsg({ success: false, text: res.message || 'Save failed' });
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="EDIT PROFILE" />

      <View style={styles.content}>
        {msg && (
          <Text style={[styles.msg, msg.success ? styles.success : styles.error]}>
            {msg.text}
          </Text>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Input value={name} onChangeText={setName} placeholder="Name" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Input value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <Input value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
        </View>

        {!isGuest && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Student ID</Text>
              <Input value={institutionalId} onChangeText={setInstitutionalId} placeholder="ID" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Degree Program</Text>
              <Input value={program} onChangeText={setProgram} placeholder="Program" />
            </View>
          </>
        )}

        <Button
          label="Save Changes"
          type={ButtonType.PRIMARY}
          onPress={handleSave}
          style={styles.saveBtn}
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
    padding: SPACING.lg,
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
  msg: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.xs,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  success: { color: COLORS.success },
  error: { color: COLORS.error },
  saveBtn: {
    marginTop: SPACING.md,
  },
});
