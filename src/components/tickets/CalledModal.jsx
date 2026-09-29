// CalledModal — Singleton component. One of three components allowed to read hooks directly (R1).
// Reads useTickets + useTicketStatus to find the earliest-called ticket and display a countdown.
// Dismiss is local state. Navigating to Scan is its only outward action.

import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, SPACING, TICKET_STATUS, TYPOGRAPHY } from '@/constants';
import { useTicketStatus } from '@/hooks/useTicketStatus';
import { useTickets } from '@/providers/TicketsProvider';
import { shortNumber } from '@/utils/ticket';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function CalledModalInner({ ticket }) {
  const [dismissed, setDismissed] = useState(false);
  const { status, secondsLeft } = useTicketStatus(ticket);

  const isVisible = !dismissed && status === 'yourTurn';

  const displaySeconds = secondsLeft ?? 0;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const countdown = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const ticketShortNumber = shortNumber(ticket.officeCode, ticket.dailySequence);

  function handleOpenScanner() {
    setDismissed(true);
    router.push('/scan');
  }

  return (
    <ModalShell visible={isVisible} onClose={() => setDismissed(true)}>
      <View style={styles.iconWrapper}>
        <Text style={styles.bellIcon}>🔔</Text>
      </View>

      <Text style={styles.title}>It's your turn!</Text>
      <Text style={styles.subtitle}>
        Head to {ticket.officeName} and scan the code within 1:00
      </Text>

      <Text style={styles.number}>{ticketShortNumber}</Text>
      <Text style={styles.countdown}>{countdown}</Text>

      <Button
        type={ButtonType.PRIMARY}
        label="Open Scanner"
        onPress={handleOpenScanner}
        accessibilityLabel="Open the scanner to verify arrival"
      />
    </ModalShell>
  );
}

export default function CalledModal() {
  const { active } = useTickets();

  // Find the earliest-called ticket
  const calledTicket = useMemo(() => {
    const called = active.filter((t) => t.status === TICKET_STATUS.CALLED);
    if (!called.length) return null;
    return called.sort(
      (a, b) => new Date(a.calledAt).getTime() - new Date(b.calledAt).getTime()
    )[0];
  }, [active]);

  if (!calledTicket) return null;

  // Key by ticket id so state resets between different called tickets
  return <CalledModalInner key={calledTicket.id} ticket={calledTicket} />;
}

const styles = StyleSheet.create({
  bellIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  iconWrapper: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.xxs,
    marginBottom: SPACING.lg,
  },
  number: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    textAlign: 'center',
  },
  countdown: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});