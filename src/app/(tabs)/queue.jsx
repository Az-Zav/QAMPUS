import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SearchInput from '@/components/primitives/SearchInput';
import EmptyState from '@/components/queue/EmptyState';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import NoticeModal from '@/components/queue/NoticeModal';
import OfficeCard from '@/components/queue/OfficeCard';
import SegmentedSwitcher from '@/components/queue/SegmentedSwitcher';
import Header from '@/components/shell/Header';
import theme from '@/theme/theme';

const OFFICES = [
  {
    id: 'R',
    code: 'R',
    name: 'University Registrar',
    location: 'Main Bldg, 1F',
    nowServing: 'R-002',
    waiting: 18,
    averageServiceMinutes: 3,
    icon: 'school-outline',
    open: true,
  },
  {
    id: 'S',
    code: 'S',
    name: 'Student Accounting Office',
    location: 'Admin Bldg, 2F',
    nowServing: 'S-014',
    waiting: 32,
    averageServiceMinutes: 4,
    icon: 'wallet-outline',
    open: true,
  },
  {
    id: 'M',
    code: 'M',
    name: 'Medical and Dental Services',
    location: 'Clinic Bldg, G/F',
    nowServing: 'M-038',
    waiting: 9,
    averageServiceMinutes: 5,
    icon: 'medkit-outline',
    open: true,
  },
];

const HISTORY = [
  {
    id: 'h1',
    group: 'TODAY',
    ticket: 'R-09-26-014',
    office: 'University Registrar',
    date: 'Sep 26, 2026 · 10:18 AM',
    status: 'COMPLETED',
  },
  {
    id: 'h2',
    group: 'TODAY',
    ticket: 'S-09-26-008',
    office: 'Student Accounting Office',
    date: 'Sep 26, 2026 · 8:42 AM',
    status: 'CANCELLED',
  },
  {
    id: 'h3',
    group: 'YESTERDAY',
    ticket: 'M-09-25-031',
    office: 'Medical and Dental Services',
    date: 'Sep 25, 2026 · 2:05 PM',
    status: 'NO_SHOW',
  },
  {
    id: 'h4',
    group: 'EARLIER',
    ticket: 'R-09-22-004',
    office: 'University Registrar',
    date: 'Sep 22, 2026 · 9:11 AM',
    status: 'CANCELLED_BY_OFFICE',
  },
];

function HistoryRow({ item }) {
  const statusStyles = {
    COMPLETED: { bg: '#E8F4EC', text: theme.colors.success, icon: 'checkmark-circle-outline', label: 'Completed' },
    CANCELLED: { bg: theme.colors.disabledBg, text: theme.colors.slate, icon: 'close-circle-outline', label: 'Cancelled' },
    NO_SHOW: { bg: '#FCE8E6', text: theme.colors.error, icon: 'person-remove-outline', label: 'No-show' },
    CANCELLED_BY_OFFICE: { bg: theme.colors.disabledBg, text: theme.colors.slate, icon: 'close-circle-outline', label: 'Cancelled by office' },
  }[item.status];

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyIcon}>
        <theme.IconSet name="ticket-outline" size={18} color={theme.colors.ink} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTicket}>{item.ticket}</Text>
        <Text style={styles.historyOffice}>{item.office}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <View style={[styles.historyStatus, { backgroundColor: statusStyles.bg }]}>
        <theme.IconSet name={statusStyles.icon} size={12} color={statusStyles.text} />
        <Text style={[styles.historyStatusText, { color: statusStyles.text }]}>{statusStyles.label}</Text>
      </View>
    </View>
  );
}

export default function Queue() {
  const [view, setView] = useState('Join');
  const [search, setSearch] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [modal, setModal] = useState(null);

  const filteredOffices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return OFFICES;
    return OFFICES.filter((office) =>
      [office.name, office.location, office.code].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search]);

  const groupedHistory = useMemo(() => {
    return ['TODAY', 'YESTERDAY', 'EARLIER'].map((group) => ({
      group,
      items: HISTORY.filter((item) => item.group === group),
    }));
  }, []);

  function openJoin(office) {
    setSelectedOffice(office);
    setModal('join');
  }

  function confirmJoin() {
    setModal('success');
  }

  return (
    <View style={styles.screen}>
      <Header title="QUEUE" hasNotification onBellPress={() => {}} onAvatarPress={() => {}} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{view === 'Join' ? 'AVAILABLE OFFICES' : 'HISTORY'}</Text>
        <Text style={styles.subtitle}>
          {view === 'Join' ? 'Pick a line to join' : 'Find a past queue'}
        </Text>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search office or service"
          style={styles.search}
        />

        <SegmentedSwitcher
          options={['Join', 'History']}
          value={view}
          onChange={setView}
        />

        {view === 'Join' ? (
          <View style={styles.list}>
            {filteredOffices.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No offices found"
                message="Try a different office or service name."
              />
            ) : (
              filteredOffices.map((office) => (
                <OfficeCard
                  key={office.id}
                  office={office}
                  onJoin={() => openJoin(office)}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.historyList}>
            {HISTORY.length === 0 ? (
              <EmptyState
                title="No queue history"
                message="Completed, cancelled, and no-show tickets will appear here."
              />
            ) : (
              groupedHistory.map(({ group, items }) => (
                <View key={group}>
                  <Text style={styles.sectionLabel}>{group}</Text>
                  {items.map((item) => <HistoryRow key={item.id} item={item} />)}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <JoinConfirmModal
        visible={modal === 'join'}
        office={selectedOffice}
        estimatedWait={selectedOffice ? `${Math.max(1, Math.ceil((selectedOffice.waiting + 1) * selectedOffice.averageServiceMinutes / 5))} min` : '10 min'}
        onClose={() => setModal(null)}
        onConfirm={confirmJoin}
      />

      <NoticeModal
        visible={modal === 'success'}
        title="You're in the queue"
        message={`Your ${selectedOffice?.code || ''} queue ticket has been issued. Check Home for your position and updates.`}
        icon="checkmark-circle-outline"
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 112,
  },
  pageTitle: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  search: {
    marginBottom: theme.spacing.md,
  },
  list: {
    marginTop: theme.spacing.lg,
  },
  historyList: {
    marginTop: theme.spacing.lg,
  },
  sectionLabel: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xs,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF4CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  historyInfo: {
    flex: 1,
    minWidth: 0,
  },
  historyTicket: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.base,
  },
  historyOffice: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    marginTop: 2,
  },
  historyDate: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    marginTop: 2,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radii.full,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: theme.spacing.xs,
  },
  historyStatusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    marginLeft: 3,
  },
});
