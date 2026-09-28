import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import InfoCard from '@/components/profile/InfoCard';
import EmptyState from '@/components/queue/EmptyState';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import OfflineState from '@/components/queue/OfflineState';
import Header from '@/components/shell/Header';
import TicketStubCard from '@/components/tickets/TicketStubCard';

import { COLORS, IconSet, InfoCardType, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { MOCK_ACTIVE_TICKETS, MOCK_OFFICES, MOCK_USER_STUDENT } from '@/data/mock';

export default function HomeScreen() {
  const router = useRouter();
  // Screen state switcher: 'populated' | 'empty' | 'offline'
  const [screenState, setScreenState] = useState('populated');
  const [selectedOffice, setSelectedOffice] = useState(null);

  const user = MOCK_USER_STUDENT;
  const activeTickets = MOCK_ACTIVE_TICKETS;
  const offices = MOCK_OFFICES;

  const handleJoinOffice = (office) => {
    if (office.queue?.status === 'OPEN') {
      setSelectedOffice(office);
    }
  };

  const handleNavigateToQueue = () => {
    router.push('/(tabs)/queue');
  };

  const handleOpenScanner = () => {
    router.push('/(tabs)/scan');
  };

  // Render active queues section dynamically
  const renderActiveQueuesSection = () => {
    if (screenState === 'offline') {
      return (
        <OfflineState
          showIconCircle={false}
          title="Temporarily unavailable"
          message="Please wait — this clears on its own."
        />
      );
    }

    if (screenState === 'empty' || activeTickets.length === 0) {
      return (
        <EmptyState
          icon="ticket-outline"
          title="No active tickets"
          message="Join a queue and your ticket will appear here."
          actionLabel="Join a Queue"
          onAction={handleNavigateToQueue}
        />
      );
    }

    return (
      <View style={styles.ticketList}>
        {activeTickets.map((ticket) => (
          <TicketStubCard
            key={ticket.id}
            ticket={{
              id: ticket.id,
              shortNumber: ticket.short_ticket_number,
              nowServing: 'R-012',
              officeName: ticket.office_name,
              location: 'Room 101',
              status: ticket.status.toLowerCase() === 'called' ? 'yourTurn' : ticket.status.toLowerCase(),
              remainingSeconds: ticket.status === 'CALLED' ? 40 : undefined,
              estimatedWaitMinutes: ticket.estimated_wait_minutes,
            }}
            onPress={() => {}}
            onOpenScanner={handleOpenScanner}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        title="HOME"
        hasNotification={true}
        onBellPress={() => {}}
        onAvatarPress={() => {}}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* State Toggle Toolbar */}
        <View style={styles.testToolbar}>
          <Text style={styles.testLabel}>Preview state:</Text>
          <View style={styles.pillsContainer}>
            {['populated', 'empty', 'offline'].map((st) => (
              <Pressable
                key={st}
                style={[styles.pill, screenState === st && styles.activePill]}
                onPress={() => setScreenState(st)}
              >
                <Text style={[styles.pillText, screenState === st && styles.activePillText]}>
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Good Afternoon, <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
        </Text>

        {/* Active Queues Header */}
        <Text style={styles.sectionTitle}>Active Queues</Text>

        {/* Dynamic Section Content */}
        {renderActiveQueuesSection()}

        {/* Operating Hours Header */}
        <View style={styles.operatingHeader}>
          <IconSet name="time-outline" size={16} color={COLORS.slate} />
          <Text style={styles.operatingTitle}>OPERATING HOURS</Text>
        </View>

        {/* Calling InfoCard with InfoCardType.OFFICE_HOURS */}
        <View style={styles.officeList}>
          {offices.map((office) => (
            <InfoCard
              key={office.id}
              type={InfoCardType.OFFICE_HOURS}
              title={office.name}
              subtitle={office.location}
              hours={`${office.operating_hours.open_time.slice(0, 5)} - ${office.operating_hours.close_time.slice(0, 5)}`}
              open={office.queue?.status === 'OPEN'}
              onPress={() => handleJoinOffice(office)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Join Confirmation Modal */}
      <JoinConfirmModal
        visible={!!selectedOffice}
        office={selectedOffice}
        estimatedWait={`${selectedOffice?.queue?.estimated_wait_minutes ?? 10} min`}
        peopleWaiting={selectedOffice?.queue?.waiting_count ?? 0}
        onClose={() => setSelectedOffice(null)}
        onConfirm={() => setSelectedOffice(null)}
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
  testToolbar: {
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
  testLabel: {
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