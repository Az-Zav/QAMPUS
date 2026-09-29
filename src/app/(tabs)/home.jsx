import InfoCard from '@/components/shell/InfoCard';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import NoticeModal from '@/components/queue/NoticeModal';
import TicketModal from '@/components/tickets/TicketModal';
import TicketStubCard from '@/components/tickets/TicketStubCard';
import { COLORS, IconSet, InfoCardType, SPACING, TYPOGRAPHY } from '@/constants';
import { useJoinEligibility } from '@/hooks/useJoinEligibility';
import { useNow } from '@/hooks/useNow';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationsProvider';
import { useOffices } from '@/providers/OfficesProvider';
import { useTickets } from '@/providers/TicketsProvider';
import { officeHours } from '@/utils/hours';
import { ticketUiStatus } from '@/utils/ticket';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { active, actions: ticketActions } = useTickets();
  const { offices } = useOffices();
  const { unreadCount } = useNotifications();
  const { checkJoin } = useJoinEligibility();
  const now = useNow();

  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleOfficePress = (office) => {
    const eligibility = checkJoin(office);
    if (!eligibility.eligible) {
      setNotice({
        title: 'Cannot Join Queue',
        message: eligibility.reason,
        icon: 'alert-circle-outline',
        destructive: true,
      });
      return;
    }
    setSelectedOffice(office);
  };

  const handleConfirmJoin = async () => {
    if (!selectedOffice) return;
    const res = await ticketActions.joinQueue(selectedOffice.id);
    setSelectedOffice(null);
    if (res.ok) {
      setNotice({
        title: "You're in the queue!",
        message: `Your ${selectedOffice.code} ticket has been issued. Check updates on your home screen.`,
        icon: 'checkmark-circle-outline',
      });
    } else {
      setNotice({
        title: 'Failed to Join',
        message: res.message || 'Something went wrong while joining the queue.',
        icon: 'alert-circle-outline',
        destructive: true,
      });
    }
  };

  const handleCancelTicket = async (ticketId) => {
    setSelectedTicket(null);
    const res = await ticketActions.cancelTicket(ticketId);
    if (!res.ok) {
      setNotice({
        title: 'Cancel Failed',
        message: res.message || 'Could not cancel ticket.',
        icon: 'alert-circle-outline',
        destructive: true,
      });
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <View style={styles.screen}>
      <Header
        title="HOME"
        hasNotification={unreadCount > 0}
        onBellPress={() => router.push('/(profile)/notifications')}
        onAvatarPress={() => router.push('/(profile)/profile')}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greeting}>
          Good Day, <Text style={styles.userName}>{firstName}</Text>
        </Text>

        {/* Active Queues Header */}
        <Text style={styles.sectionTitle}>Active Queues</Text>

        {active.length === 0 ? (
          <EmptyState type="home" onAction={() => router.push('/(tabs)/queue')} />
        ) : (
          <View style={styles.ticketList}>
            {active.map((ticket) => {
              const uiStatus = ticketUiStatus(ticket, now);
              return (
                <TicketStubCard
                  key={ticket.id}
                  ticket={{
                    ...ticket,
                    status: uiStatus.status,
                    remainingSeconds: uiStatus.secondsLeft,
                  }}
                  onPress={() => setSelectedTicket(ticket)}
                  onOpenScanner={() => router.push('/(tabs)/scan')}
                />
              );
            })}
          </View>
        )}

        {/* Operating Hours Header */}
        <View style={styles.operatingHeader}>
          <IconSet name="time-outline" size={16} color={COLORS.slate} />
          <Text style={styles.operatingTitle}>OPERATING HOURS</Text>
        </View>

        <View style={styles.officeList}>
          {offices.map((office) => {
            const hoursInfo = officeHours(office, now);
            return (
              <InfoCard
                key={office.id}
                type={InfoCardType.OFFICE_HOURS}
                title={office.name}
                subtitle={office.location}
                hours={hoursInfo.label}
                open={hoursInfo.isOpen}
                onPress={() => handleOfficePress(office)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Join Confirm Modal */}
      <JoinConfirmModal
        visible={!!selectedOffice}
        office={selectedOffice}
        estimatedWait={
          selectedOffice
            ? `about ${Math.max(1, Math.ceil(((selectedOffice.waitingCount ?? 0) + 1) * 5))} min`
            : '5 min'
        }
        peopleWaiting={selectedOffice?.waitingCount ?? 0}
        onClose={() => setSelectedOffice(null)}
        onConfirm={handleConfirmJoin}
      />

      {/* Ticket Detail Modal */}
      <TicketModal
        visible={!!selectedTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onCancel={() => handleCancelTicket(selectedTicket?.id)}
        onOpenScanner={() => {
          setSelectedTicket(null);
          router.push('/(tabs)/scan');
        }}
      />

      {/* Notice Modal */}
      <NoticeModal
        visible={!!notice}
        title={notice?.title || ''}
        message={notice?.message || ''}
        icon={notice?.icon}
        destructive={notice?.destructive}
        onClose={() => setNotice(null)}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl * 2,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  userName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
    marginBottom: SPACING.md,
  },
  ticketList: {
    marginBottom: SPACING.md,
  },
  operatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  operatingTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
    letterSpacing: 0.8,
  },
  officeList: {
    gap: SPACING.xs,
  },
});