import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import InfoCard from '@/components/profile/InfoCard';
import EmptyState from '@/components/queue/EmptyState';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import OfflineState from '@/components/queue/OfflineState';
import Header from '@/components/shell/Header';
import TicketStubCard from '@/components/tickets/TicketStubCard';

import theme from '@/theme/theme';
import { InfoCardType } from '@/theme/types';

const USER_NAME = 'Nina';

const MOCK_TICKETS = [
  {
    id: 't1',
    officeName: 'University Registrar',
    location: 'Main Bldg, 3rd Flr',
    nowServing: 'R-002',
    shortNumber: 'R-006',
    status: 'yourTurn',
    remainingSeconds: 60,
  },
  {
    id: 't2',
    officeName: 'University Registrar',
    location: 'Main Bldg, 3rd Flr',
    nowServing: 'R-002',
    shortNumber: 'R-006',
    status: 'waiting',
    estimatedWaitMinutes: 8,
  },
  {
    id: 't3',
    officeName: 'University Registrar',
    location: 'Main Bldg, 3rd Flr',
    nowServing: 'R-002',
    shortNumber: 'R-006',
    status: 'inService',
  },
];

const OPERATING_OFFICES = [
  {
    id: 'o1',
    title: 'University Registrar',
    subtitle: 'Ground Floor, Admin Building',
    hours: '08:00 - 17:00',
    open: true,
    estimatedWait: '12 min',
  },
  {
    id: 'o2',
    title: 'Medical and Dental Services',
    subtitle: '2nd Floor, Student Center',
    hours: '08:00 - 16:00',
    open: true,
    estimatedWait: '15 min',
  },
  {
    id: 'o3',
    title: 'Student Accounting Office',
    subtitle: 'Ground Floor, Finance Wing',
    hours: '08:00 - 15:00',
    open: false,
    estimatedWait: '0 min',
  },
];

export default function HomeScreen({ navigation }) {
  const [screenState, setScreenState] = useState('populated');
  const [selectedOffice, setSelectedOffice] = useState(null);

  const handleJoinOffice = (office) => {
    if (office.open) {
      setSelectedOffice(office);
    }
  };

  const handleNavigateToQueue = () => {
    if (navigation) {
      navigation.navigate('queue');
    }
  };

  const renderActiveQueuesSection = () => {
    if (screenState === 'offline') {
      return (
        <OfflineState
          icon="cloud-offline-outline"
          showIconCircle={false}
          title="Temporarily unavailable"
          message="Please wait — this clears on its own."
        />
      );
    }

    if (screenState === 'empty') {
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
        {MOCK_TICKETS.map((ticket) => (
          <TicketStubCard
            key={ticket.id}
            ticket={ticket}
            onPress={() => {}}
            onOpenScanner={() => {}}
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
        {/* Test toolbar to preview all 3 states */}
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
          Good Afternoon, <Text style={styles.userName}>{USER_NAME}</Text>
        </Text>

        {/* Active Queues Header */}
        <Text style={styles.sectionTitle}>Active Queues</Text>

        {/* Dynamic Section Content */}
        {renderActiveQueuesSection()}

        {/* Operating Hours Section */}
        <View style={styles.operatingHeader}>
          <theme.IconSet name="time-outline" size={16} color={theme.colors.slate} />
          <Text style={styles.operatingTitle}>OPERATING HOURS</Text>
        </View>

        <View style={styles.officeList}>
          {OPERATING_OFFICES.map((office) => (
            <InfoCard
              key={office.id}
              type={InfoCardType.OFFICE_HOURS}
              title={office.title}
              subtitle={office.subtitle}
              hours={office.hours}
              open={office.open}
              onPress={() => handleJoinOffice(office)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Join Confirmation Modal */}
      <JoinConfirmModal
        visible={!!selectedOffice}
        office={selectedOffice ? { name: selectedOffice.title } : null}
        estimatedWait={selectedOffice?.estimatedWait}
        onClose={() => setSelectedOffice(null)}
        onConfirm={() => setSelectedOffice(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl * 2,
  },
  testToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xs,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  testLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xs,
    color: theme.colors.slate,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xxs,
  },
  pill: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxxs,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.disabledBg,
  },
  activePill: {
    backgroundColor: theme.colors.ink,
  },
  pillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.xs,
    color: theme.colors.ink,
    textTransform: 'capitalize',
  },
  activePillText: {
    color: theme.colors.paper,
  },
  greeting: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xl,
    color: theme.colors.ink,
    marginBottom: theme.spacing.lg,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.md,
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
  },
  ticketList: {
    marginBottom: theme.spacing.md,
  },
  operatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  operatingTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xs,
    color: theme.colors.slate,
    letterSpacing: 0.8,
  },
  officeList: {
    gap: theme.spacing.xs,
  },
});