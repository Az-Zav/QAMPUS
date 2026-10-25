import ActionButton from '@/components/primitives/ActionButton';
import Dot from '@/components/primitives/Dot';
import { ButtonType, QUEUE_COPY, RADII, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Check, Copy } from '@/icons';
import { formatManualCode } from '@qampus/core/format';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const COPIED_MS = 1500;

// W03 HeaderStrip — manual code (mirrors the public display), queue readout, joining indicator,
// and the queue-level actions: Launch public display, Open/Close queue and Cancel queue.
export default function HeaderStrip({
  manualCode,
  waitingCount,
  averageServiceMinutes,
  isOpen,
  joiningOpen,
  cutoffReached,
  onOverrideCutoff,
  onLaunchDisplay,
  onOpenQueue,
  onCloseQueue,
  onCancelQueue,
}) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const id = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copyCode = async () => {
    if (await Clipboard.setStringAsync(manualCode)) setCopied(true);
  };

  const CopyIcon = copied ? Check : Copy;

  return (
    <View style={styles.strip}>
      <View style={styles.side}>
        <View style={styles.block}>
          <Text style={styles.label}>{QUEUE_COPY.manualCode}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{formatManualCode(manualCode)}</Text>
            <Pressable
              onPress={copyCode}
              accessibilityRole="button"
              accessibilityLabel={copied ? QUEUE_COPY.copied : QUEUE_COPY.copyCode}
              style={({ hovered }) => [styles.copy, hovered && styles.copyHover]}
            >
              <CopyIcon size={16} color={colors.ink} />
            </Pressable>
          </View>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>{QUEUE_COPY.queue}</Text>
          <Text style={styles.readout}>{QUEUE_COPY.readout(waitingCount, averageServiceMinutes)}</Text>
        </View>
      </View>

      <View style={[styles.side, styles.actions]}>
        <View style={styles.joining}>
          <Dot color={joiningOpen ? colors.success : colors.slate} />
          <Text style={[styles.joiningLabel, !isOpen && styles.joiningClosed]}>
            {joiningOpen ? QUEUE_COPY.joiningOpen : cutoffReached ? QUEUE_COPY.cutoffReached : QUEUE_COPY.joiningClosed}
          </Text>
          {cutoffReached && (
            <Pressable onPress={onOverrideCutoff} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.link}>{QUEUE_COPY.overrideCutoff}</Text>
            </Pressable>
          )}
        </View>
        <ActionButton
          label={QUEUE_COPY.launchDisplay}
          type={ButtonType.SECONDARY}
          onPress={onLaunchDisplay}
          style={styles.launch}
        />
        {isOpen ? (
          <ActionButton
            label={QUEUE_COPY.closeQueue}
            type={ButtonType.SECONDARY}
            onPress={onCloseQueue}
            style={styles.toggle}
          />
        ) : (
          <ActionButton label={QUEUE_COPY.openQueue} onPress={onOpenQueue} style={styles.toggle} />
        )}
        <ActionButton
          label={QUEUE_COPY.cancelQueue}
          type={ButtonType.DESTRUCTIVE}
          onPress={onCancelQueue}
          style={styles.cancel}
        />
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    strip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      paddingHorizontal: 26,
      paddingVertical: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
    },
    side: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 28, rowGap: 14 },
    block: { gap: 2 },
    label: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.sm, color: c.slate },
    codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    code: { fontFamily: STAFF_FONT.monoBold, fontSize: 24, color: c.ink },
    copy: { padding: 8, borderRadius: RADII.full, borderWidth: 1, borderColor: c.slate },
    copyHover: { backgroundColor: c.disabledBg },
    readout: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.lg, color: c.ink },
    actions: { gap: 14 },
    joining: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    joiningLabel: { fontFamily: STAFF_FONT.semibold, fontSize: 17, color: c.ink },
    joiningClosed: { color: c.slate },
    link: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 17, color: c.ink, textDecorationLine: 'underline' },
    launch: { width: 210 },
    toggle: { width: 150 },
    cancel: { width: 170 },
  });
