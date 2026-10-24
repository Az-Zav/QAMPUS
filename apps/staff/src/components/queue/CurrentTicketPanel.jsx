import ActionButton from '@/components/primitives/ActionButton';
import StatusBadge from '@/components/primitives/StatusBadge';
import {
  ButtonType,
  CURRENT_TICKET_COPY,
  GUEST_TYPE_LABEL,
  RADII,
  STAFF_FONT,
  TicketStatus,
  TYPOGRAPHY,
} from '@/constants';
import { PanelState, useThemedStyles } from '@/hooks';
import { formatCountdown } from '@qampus/core/format';
import { StyleSheet, Text, View } from 'react-native';

const BADGE_FOR = {
  [PanelState.CALLED]: TicketStatus.YOUR_TURN,
  [PanelState.EXPIRED]: TicketStatus.EXPIRED,
  [PanelState.IN_SERVICE]: TicketStatus.IN_SERVICE,
};

// Figma Staff/CurrentTicketPanel — Empty | Called | Expired | InService.
// Mark No-Show is always visible and disabled until the grace period lapses (R-12); the tooltip in
// the Called state says so. Nothing advances on its own: Call Next is always a separate action (R-05).
export default function CurrentTicketPanel({
  ticket,
  state,
  remainingSeconds,
  canCallNext,
  onCallNext,
  onVerify,
  onMarkNoShow,
  onComplete,
  style,
}) {
  const styles = useThemedStyles(makeStyles);
  const isEmpty = state === PanelState.EMPTY;
  const isExpired = state === PanelState.EXPIRED;

  const actions = [
    [
      { label: CURRENT_TICKET_COPY.callNext, onPress: onCallNext, enabled: canCallNext },
      { label: CURRENT_TICKET_COPY.verifyById, onPress: onVerify, enabled: state === PanelState.CALLED },
    ],
    [
      {
        label: CURRENT_TICKET_COPY.markNoShow,
        onPress: onMarkNoShow,
        enabled: isExpired || state === PanelState.IN_SERVICE,
        type: ButtonType.DESTRUCTIVE,
      },
      { label: CURRENT_TICKET_COPY.completeService, onPress: onComplete, enabled: state === PanelState.IN_SERVICE },
    ],
  ];

  return (
    <View style={[styles.panel, isExpired && styles.panelExpired, style]}>
      <Text style={styles.eyebrow}>{CURRENT_TICKET_COPY.nowServing}</Text>

      {isEmpty ? (
        <>
          <Text style={styles.emptyTitle}>{CURRENT_TICKET_COPY.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{CURRENT_TICKET_COPY.emptyBody}</Text>
        </>
      ) : (
        <>
          <Text style={styles.number} accessibilityRole="header">
            {ticket.short_ticket_number}
          </Text>
          <Holder holder={ticket.holder} styles={styles} />
          <View style={styles.meta} accessibilityLiveRegion="polite">
            <StatusBadge status={BADGE_FOR[state]} />
            {state === PanelState.IN_SERVICE ? (
              <Text style={styles.verified}>{CURRENT_TICKET_COPY.arrivalVerified}</Text>
            ) : (
              <Text style={[styles.countdown, isExpired && styles.danger]}>{formatCountdown(remainingSeconds)}</Text>
            )}
            {isExpired && <Text style={[styles.verified, styles.danger]}>{CURRENT_TICKET_COPY.expired}</Text>}
          </View>
        </>
      )}

      <View style={styles.actions}>
        {actions.map((row, i) => (
          <View key={i} style={styles.actionRow}>
            {row.map(({ label, onPress, enabled, type = ButtonType.PRIMARY }) => (
              <ActionButton key={label} label={label} onPress={onPress} disabled={!enabled} type={type} style={styles.action} />
            ))}
          </View>
        ))}
      </View>

      {state === PanelState.CALLED && (
        <View style={styles.tooltip} accessibilityRole="note">
          <Text style={styles.tooltipText}>{CURRENT_TICKET_COPY.noShowTooltip}</Text>
        </View>
      )}
    </View>
  );
}

function Holder({ holder, styles }) {
  const detail = holder.program ?? GUEST_TYPE_LABEL[holder.guest_type];
  return (
    <View style={styles.holder}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{holder.name.charAt(0)}</Text>
      </View>
      <View style={styles.identity}>
        <Text style={styles.name}>{holder.name}</Text>
        <Text style={styles.idLine}>
          {[holder.id_number, detail].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    panel: {
      gap: 15,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
    },
    // 2px Danger outline; padding drops by 1 so the content doesn't shift
    panelExpired: { borderWidth: 2, borderColor: c.error, padding: 23 },
    eyebrow: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.sm, color: c.slate },
    emptyTitle: { fontFamily: STAFF_FONT.semibold, fontSize: 20, color: c.ink },
    emptyBody: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    number: { fontFamily: STAFF_FONT.monoBold, fontSize: 56, color: c.ink },
    holder: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: RADII.full,
      backgroundColor: c.inverse,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: STAFF_FONT.button, fontSize: TYPOGRAPHY.size.base, color: c.onInverse },
    identity: { gap: 2 },
    name: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.lg, color: c.ink },
    idLine: { fontFamily: STAFF_FONT.mono, fontSize: 13, color: c.slate },
    meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
    countdown: { fontFamily: STAFF_FONT.monoBold, fontSize: 22, color: c.ink },
    verified: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.base, color: c.slate },
    danger: { color: c.error },
    actions: { gap: 12 },
    actionRow: { flexDirection: 'row', gap: 16 },
    action: { flex: 1 },
    tooltip: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: RADII.md,
      backgroundColor: c.inverse,
    },
    tooltipText: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.sm, color: c.onInverse },
  });
