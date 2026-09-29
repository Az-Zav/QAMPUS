import SearchInput from '@/components/primitives/SearchInput';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import NoticeModal from '@/components/queue/NoticeModal';
import OfficeCard from '@/components/queue/OfficeCard';
import SegmentedSwitcher from '@/components/queue/SegmentedSwitcher';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import ListRow from '@/components/shell/ListRow';
import { COLORS, ListRowType, QueueView, SPACING, TYPOGRAPHY } from '@/constants';
import { useJoinEligibility } from '@/hooks/useJoinEligibility';
import { useNow } from '@/hooks/useNow';
import { useNotifications } from '@/providers/NotificationsProvider';
import { useOffices } from '@/providers/OfficesProvider';
import { useTickets } from '@/providers/TicketsProvider';
import { officeHours } from '@/utils/hours';
import { formatRelativeTime } from '@/utils/time';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function QueueScreen() {
  const router = useRouter();
  const { offices } = useOffices();
  const { history, actions: ticketActions } = useTickets();
  const { unreadCount } = useNotifications();
  const { checkJoin } = useJoinEligibility();
  const now = useNow();

  const [view, setView] = useState(QueueView.JOIN);
  const [search, setSearch] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [notice, setNotice] = useState(null);

  const filteredOffices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return offices;
    return offices.filter((office) =>
      [office.name, office.location, office.code].some((val) =>
        val.toLowerCase().includes(query),
      ),
    );
  }, [search, offices]);

  const groupedHistory = useMemo(() => {
    const todayItems = [];
    const yesterdayItems = [];
    const earlierItems = [];

    history.forEach((ticket) => {
      const rel = formatRelativeTime(ticket.createdAt, now);
      if (rel.includes('min') || rel.includes('hour') || rel === 'just now') {
        todayItems.push(ticket);
      } else if (rel.includes('1 day')) {
        yesterdayItems.push(ticket);
      } else {
        earlierItems.push(ticket);
      }
    });

    return [
      { group: 'TODAY', items: todayItems },
      { group: 'YESTERDAY', items: yesterdayItems },
      { group: 'EARLIER', items: earlierItems },
    ].filter((g) => g.items.length > 0);
  }, [history, now]);

  const handleOpenJoin = (office) => {
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
        message: `Your ${selectedOffice.code} ticket has been issued. View status on Home.`,
        icon: 'checkmark-circle-outline',
      });
    } else {
      setNotice({
        title: 'Join Failed',
        message: res.message || 'Unable to join queue.',
        icon: 'alert-circle-outline',
        destructive: true,
      });
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.yellowHero}>
        <Header
          title="QUEUE"
          inverted
          hasNotification={unreadCount > 0}
          onBellPress={() => router.push('/(profile)/notifications')}
          onAvatarPress={() => router.push('/(profile)/profile')}
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
              filteredOffices.map((office) => {
                const hoursInfo = officeHours(office, now);
                return (
                  <OfficeCard
                    key={office.id}
                    office={{
                      ...office,
                      nowServing: office.nowServing || '--',
                      waiting: office.waitingCount ?? 0,
                      open: hoursInfo.isOpen,
                    }}
                    onJoin={() => handleOpenJoin(office)}
                  />
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.length === 0 ? (
              <EmptyState type="history" />
            ) : (
              groupedHistory.map(({ group, items }) => (
                <View key={group}>
                  <Text style={styles.sectionLabel}>{group}</Text>
                  {items.map((item) => (
                    <ListRow
                      key={item.id}
                      type={ListRowType.HISTORY}
                      title={item.officeName}
                      subtitle={`Ticket #${item.shortTicketNumber || item.dailySequence}`}
                      meta={formatRelativeTime(item.completedAt || item.createdAt, now)}
                      status={item.status}
                      style={styles.historyCard}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Join Confirmation Modal */}
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
    gap: SPACING.sm,
  },
  historyCard: {
    marginBottom: SPACING.xs,
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
