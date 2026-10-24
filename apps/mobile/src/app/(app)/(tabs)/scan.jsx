import NoticeModal from '@/components/modals/NoticeModal';
import { MODAL_COPY, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useCheckIn, useTheme, useThemedStyles } from '@/hooks';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const CheckInModal = Object.freeze({ SUCCESS: 'success', FAILED: 'failed' });

export default function Scan() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { checkIn, checkingIn } = useCheckIn();

  const [code, setCode] = useState('');
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (checkingIn || !code.trim()) return;
    const reason = await checkIn(code);
    setError(reason);
    setModal(reason ? CheckInModal.FAILED : CheckInModal.SUCCESS);
    if (!reason) setCode('');
  };

  const closeSuccess = () => {
    setModal(null);
    router.navigate('/home');
  };

  return (
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
        Align the QR code within the frame
      </Text>

      <TextInput
        style={styles.codeInput}
        placeholder="Enter code manually"
        placeholderTextColor={withOpacity(colors.onInverse, 0.6)}
        keyboardType="number-pad"
        autoCapitalize="none"
        autoCorrect={false}
        textAlign="center"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        onSubmitEditing={submit}
        returnKeyType="done"
        editable={!checkingIn}
      />

      <NoticeModal
        visible={modal === CheckInModal.SUCCESS}
        icon={MODAL_COPY.checkIn.successIcon}
        title={MODAL_COPY.checkIn.successTitle}
        body={MODAL_COPY.checkIn.successBody}
        buttonLabel={MODAL_COPY.checkIn.successButton}
        onClose={closeSuccess}
      />

      <NoticeModal
        visible={modal === CheckInModal.FAILED}
        icon={MODAL_COPY.checkIn.failedIcon}
        title={MODAL_COPY.checkIn.failedTitle}
        body={MODAL_COPY.checkIn.failedBody(error)}
        buttonLabel={MODAL_COPY.checkIn.failedButton}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.paper,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 64,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    color: c.ink,
    marginBottom: 40,
  },
  scannerArea: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 230,
    height: 230,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: c.gold,
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
    marginTop: 24,
    color: c.slate,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    textAlign: 'center',
  },
  codeInput: {
    width: '88%',
    height: 64,
    marginTop: 28,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: c.onInverse,
    borderRadius: RADII.huge ?? 32,
    backgroundColor: c.inverse,
    color: c.onInverse,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
  },
});
