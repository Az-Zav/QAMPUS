import ModalShell from '@/components/modals/ModalShell';
import NoticeModal from '@/components/modals/NoticeModal';
import { useBottomNavClearance } from '@/components/shell/BottomNav';
import { ButtonType, IconSet, MODAL_COPY, RADII, SCAN_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { useCheckIn, useThemedStyles } from '@/hooks';
import { parseCheckInPayload, TicketingError } from '@qampus/backend';
import { Button } from '@qampus/ui';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CheckInModal = Object.freeze({ SUCCESS: 'success', FAILED: 'failed' });

// The scan window: the camera shows through it, everything else on the screen is darkened
const WINDOW = 230;
// The light sheet behind the floating nav bar: about the bar's height, a little of it showing above the bar
const SHEET_HEIGHT = 88;
// Fixed colours: this screen is always a camera view with a dark veil, whatever the app theme is
const VEIL = 'rgba(0, 0, 0, 0.62)';
const BACKDROP = '#121110';
const ON_VEIL = '#FFFFFF';
const ON_VEIL_SOFT = 'rgba(255, 255, 255, 0.78)';

// S11 Scan to Check In (R-20, R-21): the camera fills the screen and reads the office QR; typing the 6 digits is
// always there as the fallback. Both end in the same check-in, so the validation is identical.
export default function Scan() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navClearance = useBottomNavClearance();
  const { checkIn, checkingIn } = useCheckIn();
  const [permission, requestPermission] = useCameraPermissions();

  const [code, setCode] = useState('');
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);
  // The "Allow camera" dialog is offered once; the frame lets the student bring it back
  const [permissionDismissed, setPermissionDismissed] = useState(false);
  // The camera reports the same QR many times a second: only the first read counts until the result dialog closes
  const scanLocked = useRef(false);

  // Only one camera preview may be active, and it should not run behind another screen or a dialog
  const cameraOn = isFocused && !!permission?.granted && modal === null;
  const needsPermission = !!permission && !permission.granted;
  // True until the phone says it will not ask again; `permission` is null until it has answered, so guard every read
  const canAsk = permission?.canAskAgain ?? true;
  const permissionOpen = isFocused && needsPermission && !permissionDismissed && modal === null;

  // The scan window sits near the top, centred across; the four veil pieces around it leave it clear
  const windowTop = Math.max(150, Math.round(height * 0.25));
  const windowLeft = Math.round((width - WINDOW) / 2);

  useEffect(() => {
    if (isFocused) scanLocked.current = false;
  }, [isFocused]);

  const finish = (reason) => {
    setError(reason);
    setModal(reason ? CheckInModal.FAILED : CheckInModal.SUCCESS);
  };

  const submit = async () => {
    if (checkingIn || !code.trim()) return;
    const reason = await checkIn(code);
    finish(reason);
    if (!reason) setCode('');
  };

  const handleScan = async ({ data }) => {
    if (scanLocked.current || checkingIn) return;
    scanLocked.current = true;
    const parsed = parseCheckInPayload(data);
    // A QR that is not ours gets the same answer as a wrong code
    finish(parsed ? await checkIn(parsed.code, { officeCode: parsed.officeCode }) : TicketingError.INVALID_CODE);
  };

  const closeSuccess = () => {
    setModal(null);
    router.navigate('/home');
  };

  // Allow: the system asks (or, once blocked for good, the phone's settings do); either way the dialog is done
  const answerPermission = async () => {
    setPermissionDismissed(true);
    if (canAsk) await requestPermission();
    else await Linking.openSettings();
  };

  const closeFailed = () => {
    scanLocked.current = false;
    setModal(null);
  };

  return (
    <View style={styles.container}>
      {/* White status bar icons over the camera and the veil */}
      {isFocused && <StatusBar style="light" />}

      {/* The preview is a native surface: no rounded clip, overflow or background around it, or it can render blank */}
      {cameraOn && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
          onMountError={(event) => console.warn('Camera mount error', event?.message ?? event)}
        />
      )}

      {/* The veil: four pieces around the scan window, so the window itself stays clear */}
      <View pointerEvents="none" style={[styles.veil, { top: 0, left: 0, right: 0, height: windowTop }]} />
      <View pointerEvents="none" style={[styles.veil, { top: windowTop + WINDOW, left: 0, right: 0, bottom: 0 }]} />
      <View pointerEvents="none" style={[styles.veil, { top: windowTop, left: 0, width: windowLeft, height: WINDOW }]} />
      <View pointerEvents="none" style={[styles.veil, { top: windowTop, left: windowLeft + WINDOW, right: 0, height: WINDOW }]} />

      {/* The light sheet the floating nav bar sits on, its top corners rounded over the camera */}
      <View pointerEvents="none" style={[styles.sheet, { height: SHEET_HEIGHT + insets.bottom }]} />

      <Text style={styles.title}>{SCAN_COPY.title}</Text>

      <View style={[styles.window, { top: windowTop, left: windowLeft }]}>
        {!permission && <Text style={styles.cameraOffHint}>{SCAN_COPY.checking}</Text>}
        {needsPermission && (
          <Pressable
            style={styles.cameraOff}
            onPress={() => setPermissionDismissed(false)}
            accessibilityRole="button"
            accessibilityLabel={`${SCAN_COPY.cameraOffLabel}. ${SCAN_COPY.cameraOffHint}`}
          >
            <IconSet name="camera-outline" size={32} color={ON_VEIL_SOFT} />
            <Text style={styles.cameraOffLabel}>{SCAN_COPY.cameraOffLabel}</Text>
            <Text style={styles.cameraOffHint}>{SCAN_COPY.cameraOffHint}</Text>
          </Pressable>
        )}
        <View pointerEvents="none" style={[styles.corner, styles.topLeft]} />
        <View pointerEvents="none" style={[styles.corner, styles.topRight]} />
        <View pointerEvents="none" style={[styles.corner, styles.bottomLeft]} />
        <View pointerEvents="none" style={[styles.corner, styles.bottomRight]} />
      </View>

      <Text style={[styles.instruction, { top: windowTop + WINDOW + SPACING.lg }]}>
        {permission?.granted ? SCAN_COPY.instruction : SCAN_COPY.instructionNoCamera}
      </Text>

      <TextInput
        style={[styles.codeInput, { bottom: navClearance + SPACING.lg }]}
        placeholder={SCAN_COPY.manualPlaceholder}
        placeholderTextColor={ON_VEIL_SOFT}
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
        selectionColor={ON_VEIL}
      />

      <ModalShell
        visible={permissionOpen}
        onClose={() => setPermissionDismissed(true)}
        icon={SCAN_COPY.permission.icon}
        title={SCAN_COPY.permission.title}
        subtitle={canAsk ? SCAN_COPY.permission.body : SCAN_COPY.permission.blockedBody}
        actions={
          <>
            <Button
              type={ButtonType.PRIMARY}
              label={canAsk ? SCAN_COPY.permission.allow : SCAN_COPY.permission.openSettings}
              onPress={answerPermission}
            />
            <Button
              type={ButtonType.SECONDARY}
              label={SCAN_COPY.permission.typeInstead}
              onPress={() => setPermissionDismissed(true)}
            />
          </>
        }
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
        onClose={closeFailed}
      />
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKDROP,
  },
  veil: {
    position: 'absolute',
    backgroundColor: VEIL,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.paper,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
  },
  title: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    color: ON_VEIL,
  },
  window: {
    position: 'absolute',
    width: WINDOW,
    height: WINDOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOff: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADII.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    padding: SPACING.lg,
  },
  cameraOffLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    color: ON_VEIL,
    textAlign: 'center',
  },
  cameraOffHint: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: ON_VEIL_SOFT,
    textAlign: 'center',
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
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: ON_VEIL_SOFT,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
  },
  // A see-through field with a white outline, drawn over the veil above the bottom bar
  codeInput: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    height: 64,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: ON_VEIL,
    borderRadius: RADII.huge ?? 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: ON_VEIL,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
  },
});
