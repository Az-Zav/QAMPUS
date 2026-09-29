import Button from '@/components/primitives/Button';
import NoticeModal from '@/components/queue/NoticeModal';
import Header from '@/components/shell/Header';
import { ButtonType, COLORS, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTickets } from '@/providers/TicketsProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ScanScreen() {
  const router = useRouter();
  const { actions } = useTickets();
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState(null);

  const handleVerify = async () => {
    if (!code.trim()) return;
    const res = await actions.arrive(code.trim());
    if (res.ok) {
      setNotice({
        title: 'Arrival Verified!',
        message: 'Your arrival has been recorded. Please proceed to the office window.',
        icon: 'checkmark-circle-outline',
        onClose: () => router.replace('/(tabs)/home'),
      });
    } else {
      setNotice({
        title: 'Verification Failed',
        message: res.message || 'Invalid arrival code.',
        icon: 'alert-circle-outline',
        destructive: true,
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="SCANNER" />

      <View style={styles.container}>
        <Text style={styles.title}>Scan to Check In</Text>

        <View style={styles.scannerArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <Text style={styles.instruction}>
          Align the office QR code within the frame or enter manual code below
        </Text>

        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={setCode}
          placeholder="Enter arrival code"
          placeholderTextColor={COLORS.slate}
          autoCapitalize="characters"
          autoCorrect={false}
          textAlign="center"
        />

        <Button
          label="Verify Arrival"
          type={ButtonType.PRIMARY}
          onPress={handleVerify}
          style={styles.verifyButton}
        />
      </View>

      <NoticeModal
        visible={!!notice}
        title={notice?.title || ''}
        message={notice?.message || ''}
        icon={notice?.icon}
        destructive={notice?.destructive}
        onClose={() => {
          const cb = notice?.onClose;
          setNotice(null);
          cb?.();
        }}
        buttonLabel="OK"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  scannerArea: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: COLORS.gold,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instruction: {
    marginTop: SPACING.md,
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    textAlign: 'center',
  },
  codeInput: {
    width: '88%',
    height: 52,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.white,
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
  },
  verifyButton: {
    width: '88%',
    marginTop: SPACING.md,
  },
});
