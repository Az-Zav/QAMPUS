import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SearchInput from '@/components/primitives/SearchInput';
import SegmentedSwitcher from '@/components/primitives/SegmentedSwitcher';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import OfficeCard from '@/components/queue/OfficeCard';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import ListRow from '@/components/shell/ListRow';
import NoticeModal from '@/components/shell/NoticeModal';
import { EmptyStateType, ListRowType, QueueModalKey, QueueView, SPACING, TYPOGRAPHY } from '@/constants';
import { useMyTickets, useNotifications, useOffices, useThemedStyles } from '@/hooks';
import { groupHistory, matchesOfficeQuery } from '@/utils';

export default function Queue() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { offices } = useOffices();
  const { history, now } = useMyTickets();
  const { unreadCount } = useNotifications();

  const [view, setView] = useState(QueueView.JOIN);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  // Persists after close so the modal keeps its content while fading out
  const [selectedOffice, setSelectedOffice] = useState(null);

  const filteredOffices = useMemo(
    () => offices.filter((office) => matchesOfficeQuery(office, search)),
    [offices, search],
  );

  const groupedHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = q
      ? history.filter((item) => [item.fullNumber, item.officeName].some((v) => v.toLowerCase().includes(q)))
      : history;
    return groupHistory(matches, now);
  }, [history, search, now]);

  const openJoin = (office) => {
    setSelectedOffice(office);
    setModal(QueueModalKey.JOIN_CONFIRM);
  };

  const closeModal = () => setModal(null);

  return (
    <View style={styles.screen}>
      <View style={styles.yellowHero}>
        <Header title="QUEUE" inverted hasNotification={unreadCount > 0} onBellPress={() => router.push('/notifications')} onAvatarPress={() => router.push('/profile')} />

        <View style={styles.heroContent}>
          <Text style={styles.pageTitle}>{view === QueueView.JOIN ? 'AVAILABLE OFFICES' : 'HISTORY'}</Text>
          <Text style={styles.subtitle}>{view === QueueView.JOIN ? 'Pick a line to join' : 'Find a past queue'}</Text>

          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder={view === QueueView.JOIN ? 'Search office or service' : 'Search ticket or office'}
            style={styles.search}
          />

          <SegmentedSwitcher options={[QueueView.JOIN, QueueView.HISTORY]} value={view} onChange={setView} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {view === QueueView.JOIN ? (
          filteredOffices.length === 0 ? (
            <EmptyState type={EmptyStateType.NO_RESULTS} />
          ) : (
            filteredOffices.map((office) => (
              <OfficeCard key={office.id} office={office} onJoin={() => openJoin(office)} />
            ))
          )
        ) : groupedHistory.length === 0 ? (
          <EmptyState type={EmptyStateType.NO_HISTORY} />
        ) : (
          groupedHistory.map(({ group, items }) => (
            <View key={group} style={styles.historyGroup}>
              <Text style={styles.sectionLabel}>{group}</Text>
              {items.map((item) => (
                <ListRow
                  key={item.id}
                  type={ListRowType.HISTORY}
                  title={item.fullNumber}
                  subtitle={item.officeName}
                  meta={item.dateLabel}
                  status={item.status}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <JoinConfirmModal
        visible={modal === QueueModalKey.JOIN_CONFIRM}
        office={selectedOffice}
        onClose={closeModal}
        onConfirm={() => setModal(QueueModalKey.SUCCESS)}
      />

      <NoticeModal
        visible={modal === QueueModalKey.SUCCESS}
        icon="checkmark-circle-outline"
        title="You're in the queue"
        body={`Your ${selectedOffice?.code ?? ''} queue ticket has been issued. Check Home for your position and updates.`}
        buttonLabel="Done"
        onClose={closeModal}
      />
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.paper,
  },
  yellowHero: {
    backgroundColor: c.gold,
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
    color: c.onGold,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: c.onGold,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxl,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  search: {
    marginBottom: SPACING.md,
  },
  historyGroup: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    color: c.slate,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    letterSpacing: 1,
    marginTop: SPACING.sm,
  },
});
