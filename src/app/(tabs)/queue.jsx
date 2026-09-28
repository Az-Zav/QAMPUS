import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SearchInput from '@/components/primitives/SearchInput';
import EmptyState from '@/components/queue/EmptyState';
import HistoryRow from '@/components/queue/HistoryRow';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import NoticeModal from '@/components/queue/NoticeModal';
import OfficeCard from '@/components/queue/OfficeCard';
import SegmentedSwitcher from '@/components/queue/SegmentedSwitcher';
import Header from '@/components/shell/Header';
import { COLORS, HistoryGroup, QueueModalKey, QueueView, SPACING, TYPOGRAPHY } from '@/constants';
import { MOCK_HISTORY_TICKETS, MOCK_OFFICES } from '@/data/mock';

export default function Queue() {
  const [view, setView] = useState(QueueView.JOIN);
  const [search, setSearch] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [modal, setModal] = useState(null);

  const offices = MOCK_OFFICES;
  const history = MOCK_HISTORY_TICKETS;

  const filteredOffices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return offices;
    return offices.filter((office) =>
      [office.name, office.location, office.code].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, offices]);

  const groupedHistory = useMemo(() => {
    return [
      { group: HistoryGroup.TODAY, items: history.filter((_, idx) => idx === 0) },
      { group: HistoryGroup.YESTERDAY, items: history.filter((_, idx) => idx === 1) },
      { group: HistoryGroup.EARLIER, items: history.filter((_, idx) => idx >= 2) },
    ].filter((g) => g.items.length > 0);
  }, [history]);

  function openJoin(office) {
    setSelectedOffice(office);
    setModal(QueueModalKey.JOIN_CONFIRM);
  }

  function confirmJoin() {
    setModal(QueueModalKey.SUCCESS);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.yellowHero}>
        <Header
          title="QUEUE"
          inverted
          hasNotification
          onBellPress={() => {}}
          onAvatarPress={() => {}}
        />

        <View style={styles.heroContent}>
          <Text style={styles.pageTitle}>
            {view === QueueView.JOIN ? 'AVAILABLE OFFICES' : 'HISTORY'}
          </Text>
          <Text style={styles.subtitle}>
            {view === QueueView.JOIN ? 'Pick a line to join' : 'Find a past queue'}
          </Text>

          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search office or service"
            style={styles.search}
          />

          <SegmentedSwitcher
            options={[QueueView.JOIN, QueueView.HISTORY]}
            value={view}
            onChange={setView}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {view === QueueView.JOIN ? (
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
                  office={{
                    id: office.id,
                    code: office.code,
                    name: office.name,
                    location: office.location,
                    nowServing: office.queue?.current_ticket_number ?? '—',
                    waiting: office.queue?.waiting_count ?? 0,
                    averageServiceMinutes: office.default_service_minutes,
                    open: office.queue?.status === 'OPEN',
                  }}
                  onJoin={() => openJoin(office)}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.length === 0 ? (
              <EmptyState
                title="No queue history"
                message="Completed, cancelled, and no-show tickets will appear here."
              />
            ) : (
              groupedHistory.map(({ group, items }) => (
                <View key={group}>
                  <Text style={styles.sectionLabel}>{group}</Text>
                  {items.map((item) => (
                    <HistoryRow key={item.id} item={item} />
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <JoinConfirmModal
        visible={modal === QueueModalKey.JOIN_CONFIRM}
        office={selectedOffice}
        estimatedWait={
          selectedOffice
            ? `${Math.max(
                1,
                Math.ceil(
                  (((selectedOffice.queue?.waiting_count ?? 0) + 1) *
                    selectedOffice.default_service_minutes) /
                    5,
                ),
              )} min`
            : '10 min'
        }
        peopleWaiting={selectedOffice?.queue?.waiting_count ?? 0}
        onClose={() => setModal(null)}
        onConfirm={confirmJoin}
      />

      <NoticeModal
        visible={modal === QueueModalKey.SUCCESS}
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
    backgroundColor: COLORS.paper,
  },
  yellowHero: {
    backgroundColor: COLORS.gold,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: SPACING.lg,
  },
  heroContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 112,
  },
  pageTitle: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxl,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  search: {
    marginBottom: SPACING.md,
  },
  list: {
    marginTop: 0,
  },
  historyList: {
    marginTop: 0,
  },
  sectionLabel: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
});
