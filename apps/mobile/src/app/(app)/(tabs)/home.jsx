import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import JoinConfirmModal from '@/components/modals/JoinConfirmModal';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import InfoCard from '@/components/shell/InfoCard';
import TicketModal from '@/components/modals/TicketModal';
import TicketStubCard from '@/components/tickets/TicketStubCard';

import { EmptyStateType, IconSet, InfoCardType, SPACING, TYPOGRAPHY } from '@/constants';
import { usePreview } from '@/dev/previews'; // DEV-PREVIEW
import { useMyTickets, useNotifications, useOffices, useSession, useTheme, useThemedStyles } from '@/hooks';
import { greetingFor } from '@/utils';

const HomeModal = Object.freeze({ TICKET: 'ticket', JOIN: 'join' });

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useSession();
  const { active: liveActive, now } = useMyTickets();
  const { offices } = useOffices();
  const { unreadCount } = useNotifications();

  const preview = usePreview('home', { barStyle: styles.previewBar }); // DEV-PREVIEW
  const active = preview.data?.active ?? liveActive; // DEV-PREVIEW
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
    if (preview.data?.offline) { // DEV-PREVIEW
      return <EmptyState type={EmptyStateType.OFFLINE} />;
    }

    if (active.length === 0) {
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
        {preview.bar /* DEV-PREVIEW */}

        <Text style={styles.greeting}>
          {greetingFor(now)}, <Text style={styles.userName}>{user?.name.split(' ')[0]}</Text>
        </Text>

        <Text style={styles.sectionTitle}>Active Queues</Text>
        {renderActiveQueues()}

        <View style={styles.operatingHeader}>
          <IconSet name="time-outline" size={16} color={colors.slate} />
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

const makeStyles = (c) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.paper,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl * 2,
  },
  previewBar: { marginBottom: SPACING.md }, // DEV-PREVIEW
  greeting: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xl,
    color: c.ink,
    marginBottom: SPACING.lg,
  },
  userName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    color: c.ink,
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
    color: c.slate,
    letterSpacing: 0.8,
  },
  officeList: {
    gap: SPACING.xs,
  },
});