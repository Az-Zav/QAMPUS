import BrandLockup, { LockupTone } from '@/components/brand/BrandLockup';
import DisplayStub from '@/components/display/DisplayStub';
import Outage from '@/components/shell/Outage';
import {
  ColorScheme,
  DISPLAY_COPY,
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  PALETTES,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';
import { OfficeLookup, useDisplayQueue, useOfficeByCode } from '@/hooks';
import { checkInPayload } from '@/utils/office';
import { formatManualCode } from '@qampus/core/format';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// A public screen is not user-themed: it always renders the light palette's Ink/Paper split
const c = PALETTES[ColorScheme.LIGHT];
const CHECK_IN_WIDTH = 1440;
const QR_BOX = 600;
const QR_PADDING = 36;

// D01 — Public display at /display/:officeCode. No staff login, no scrolling, no interactive elements. Opened from
// the staff console's "Launch public display" button (a new tab), or on its own on the counter's screen.
// Designed on a 1920x1080 canvas and scaled to fit the screen it is shown on.
export default function Display() {
  const { code } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const { office, status } = useOfficeByCode(code);
  const display = useDisplayQueue(office);
  const scale = Math.min(width / DISPLAY_WIDTH, height / DISPLAY_HEIGHT);

  if (status === OfficeLookup.ERROR || display?.error) return <Outage />;

  // Still loading the session, the office or the queue: a blank screen, not a flash of "closed"
  if (status === OfficeLookup.LOADING || (office && !display)) return <View style={styles.stage} />;

  if (!office) {
    return (
      <View style={[styles.stage, styles.missing]}>
        <Text style={styles.missingText}>{DISPLAY_COPY.unknownOffice}</Text>
      </View>
    );
  }

  return (
    <View style={styles.stage}>
      <View style={[styles.canvas, { transform: [{ scale }] }]}>
        <View style={styles.checkIn}>
          <BrandLockup tone={LockupTone.ON_DARK} style={styles.lockup} />
          {display.isOpen ? (
            <>
              <View style={styles.qrBox}>
                <QRCode
                  value={checkInPayload(office)}
                  size={QR_BOX - QR_PADDING * 2}
                  color={c.ink}
                  backgroundColor={c.paper}
                  quietZone={0}
                />
              </View>
              <Text style={[styles.centered, styles.scan]}>{DISPLAY_COPY.scanToCheckIn}</Text>
              <Text style={[styles.centered, styles.orCode]}>{DISPLAY_COPY.orEnterCode}</Text>
              <Text style={[styles.centered, styles.code]}>{formatManualCode(office.check_in_code)}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.centered, styles.closedTitle]}>{DISPLAY_COPY.closedTitle}</Text>
              <Text style={[styles.centered, styles.closedBody]}>{DISPLAY_COPY.opensAgain(office.opens)}</Text>
            </>
          )}
        </View>

        <View style={styles.strip}>
          <Text style={styles.office}>{office.short_name}</Text>
          {display.isOpen ? <OpenStrip display={display} /> : <ClosedStrip />}
        </View>
      </View>
    </View>
  );
}

function OpenStrip({ display }) {
  const { nowServing, next } = display;

  return (
    <>
      <Text style={styles.label}>{DISPLAY_COPY.nowServing}</Text>
      {nowServing ? (
        <View style={styles.nowServing}>
          <DisplayStub number={nowServing} large fill={c.gold} text={c.onGold} cutout={c.paper} />
        </View>
      ) : next.length > 0 ? (
        <Text style={styles.waitingForNext}>{DISPLAY_COPY.waitingForNext}</Text>
      ) : (
        <>
          <Text style={styles.stripTitle}>{DISPLAY_COPY.noOneWaiting}</Text>
          <Text style={styles.scanToJoin}>{DISPLAY_COPY.scanToJoin}</Text>
        </>
      )}
      {next.length > 0 && (
        <>
          <Text style={[styles.label, nowServing ? styles.nextLabel : styles.nextLabelLoose]}>{DISPLAY_COPY.next}</Text>
          <View style={styles.nextList}>
            {next.map((number) => (
              <DisplayStub key={number} number={number} fill={c.inverse} text={c.onInverse} cutout={c.paper} />
            ))}
          </View>
        </>
      )}
    </>
  );
}

function ClosedStrip() {
  return (
    <>
      <Text style={[styles.stripTitle, styles.closedStripTitle]}>{DISPLAY_COPY.closedStrip}</Text>
      <Text style={styles.closedStripBody}>{DISPLAY_COPY.closedStripBody}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: c.inverse },
  canvas: { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT, flexDirection: 'row' },

  // Check-in side (Ink): absolute positions follow the 1920x1080 frame
  checkIn: { width: CHECK_IN_WIDTH, height: '100%', backgroundColor: c.inverse },
  lockup: { position: 'absolute', left: 72, top: 64 },
  qrBox: {
    position: 'absolute',
    left: (CHECK_IN_WIDTH - QR_BOX) / 2,
    top: 182,
    width: QR_BOX,
    height: QR_BOX,
    padding: QR_PADDING,
    borderRadius: 16,
    backgroundColor: c.paper,
  },
  centered: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  scan: { top: 830, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 46, color: c.gold },
  orCode: { top: 894, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 30, color: c.slate },
  code: { top: 930, fontFamily: STAFF_FONT.monoBold, fontSize: 72, color: c.onInverse },
  closedTitle: { top: 452, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 96, color: c.onInverse },
  closedBody: { top: 572, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 40, color: c.slate },

  // Queue strip (Paper)
  strip: { flex: 1, alignItems: 'center', paddingTop: 52, backgroundColor: c.paper },
  office: { fontFamily: STAFF_FONT.semibold, fontSize: 26, color: c.ink, textAlign: 'center' },
  label: { marginTop: 34, fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 22, color: c.slate },
  nowServing: { marginTop: 19 },
  nextLabel: { marginTop: 40 },
  nextLabelLoose: { marginTop: 70 },
  nextList: { marginTop: 19, gap: 20 },
  waitingForNext: {
    marginTop: 69,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 30,
    lineHeight: 40,
    color: c.slate,
    textAlign: 'center',
  },
  stripTitle: {
    marginTop: 71,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 40,
    lineHeight: 48,
    color: c.ink,
    textAlign: 'center',
  },
  scanToJoin: { marginTop: 24, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 26, color: c.slate },
  closedStripTitle: { marginTop: 134 },
  closedStripBody: {
    marginTop: 12,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 22,
    lineHeight: 30,
    color: c.slate,
    textAlign: 'center',
  },

  missing: { padding: 48 },
  missingText: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 32, color: c.onInverse, textAlign: 'center' },
});
