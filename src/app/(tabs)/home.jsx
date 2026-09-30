import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import InfoCard from '@/components/shell/InfoCard';
import TicketModal from '@/components/tickets/TicketModal';
import TicketStubCard from '@/components/tickets/TicketStubCard';

import { COLORS, EmptyStateType, IconSet, InfoCardType, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useMyTickets, useNotifications, useOffices, useSession } from '@/hooks';
import { greetingFor } from '@/utils';

// Dev-only preview of the section's alternate states
const PREVIEW_STATES = ['populated', 'empty', 'offline'];

const HomeModal = Object.freeze({ TICKET: 'ticket', JOIN: 'join' });

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { active, now } = useMyTickets();
  const { offices } = useOffices();
  const { unreadCount } = useNotifications();

  const [previewState, setPreviewState] = useState('populated');
  const [modal, setModal] = useState(null);
  // Selections persist after close so the modal keeps its content while fading out
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const selectedTicket = active.find((t) => t.id === selectedTicketId) ?? null;
  const closeModal = () => setModal(null);

  const openTicket = (ticket) => {
    setSelectedTicketId(ticket.id);
    setModal(HomeModal.TICKET);
  };

  const openJoin = (office) => {
    if (!office.open) return;
    setSelectedOffice(office);
    setModal(HomeModal.JOIN);
  };

  const openScanner = () => {
    closeModal();
    router.push('/scan');
  };

  const renderActiveQueues = () => {
    if (previewState === 'offline') {
      return <EmptyState type={EmptyStateType.OFFLINE} />;
    }

    if (previewState === 'empty' || active.length === 0) {
      return <EmptyState type={EmptyStateType.NO_TICKETS} onAction={() => router.push('/queue')} />;
    }

    return (
      <View style={styles.ticketList}>
        {active.map((ticket) => (
          <TicketStubCard
            key={ticket.id}
            ticket={ticket}
            onPress={() => openTicket(ticket)}
            onOpenScanner={openScanner}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header title="HOME" hasNotification={unreadCount > 0} onBellPress={() => router.push('/notifications')} onAvatarPress={() => router.push('/profile')} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {__DEV__ && (
          <View style={styles.devToolbar}>
            <Text style={styles.devLabel}>Preview state:</Text>
            <View style={styles.pillsContainer}>
              {PREVIEW_STATES.map((state) => (
                <Pressable
                  key={state}
                  style={[styles.pill, previewState === state && styles.activePill]}
                  onPress={() => setPreviewState(state)}
                >
                  <Text style={[styles.pillText, previewState === state && styles.activePillText]}>{state}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.greeting}>
          {greetingFor(now)}, <Text style={styles.userName}>{user?.name.split(' ')[0]}</Text>
        </Text>

        <Text style={styles.sectionTitle}>Active Queues</Text>
        {renderActiveQueues()}

        <View style={styles.operatingHeader}>
          <IconSet name="time-outline" size={16} color={COLORS.slate} />
          <Text style={styles.operatingTitle}>OPERATING HOURS</Text>
        </View>

        <View style={styles.officeList}>
          {offices.map((office) => (
            <InfoCard
              key={office.id}
              type={InfoCardType.OFFICE_HOURS}
              title={office.name}
              subtitle={office.location}
              hours={office.hours}
              open={office.open}
              onPress={() => openJoin(office)}
            />
          ))}
        </View>
      </ScrollView>

      <TicketModal
        visible={modal === HomeModal.TICKET}
        ticket={selectedTicket}
        onClose={closeModal}
        onCancel={closeModal}
        onOpenScanner={openScanner}
      />

      <JoinConfirmModal
        visible={modal === HomeModal.JOIN}
        office={selectedOffice}
        onClose={closeModal}
        onConfirm={closeModal}
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
  devToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.xs,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  devLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: SPACING.xxs,
  },
  pill: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxxs,
    borderRadius: RADII.full,
    backgroundColor: COLORS.disabledBg,
  },
  activePill: {
    backgroundColor: COLORS.ink,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.ink,
    textTransform: 'capitalize',
  },
  activePillText: {
    color: COLORS.paper,
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