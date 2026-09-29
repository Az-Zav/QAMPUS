import Header from '@/components/shell/Header';
import InfoCard from '@/components/shell/InfoCard';
import ListRow from '@/components/shell/ListRow';
import { COLORS, InfoCardType, ListRowType, SPACING, TYPOGRAPHY } from '@/constants';
import { useNow } from '@/hooks/useNow';
import { useBans } from '@/providers/BansProvider';
import { isBanned } from '@/utils/bans';
import { formatRelativeTime } from '@/utils/time';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BansScreen() {
  const { ban, offenses } = useBans();
  const now = useNow();

  const userIsBanned = isBanned(ban, now);

  return (
    <View style={styles.screen}>
      <Header title="OFFENSES & BANS" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Meter Card */}
        <InfoCard
          type={InfoCardType.STRIKE_METER}
          offenses={offenses?.length || 0}
          banned={userIsBanned}
          style={styles.cardMargin}
        />

        {/* Offenses List */}
        <Text style={styles.sectionTitle}>Offenses Record</Text>

        {!offenses || offenses.length === 0 ? (
          <View style={styles.cleanBox}>
            <Text style={styles.cleanTitle}>No Offenses</Text>
            <Text style={styles.cleanSub}>You have a clean record. Keep it up!</Text>
          </View>
        ) : (
          <View style={styles.offenseList}>
            {offenses.map((offense) => (
              <ListRow
                key={offense.id}
                type={ListRowType.OFFENSE}
                title={offense.officeName || 'Queue Offense'}
                subtitle={`Reason: ${offense.reason || 'Missed turn'} • ${formatRelativeTime(offense.createdAt, now)}`}
                status={offense.status}
              />
            ))}
          </View>
        )}

        {/* Policy Section */}
        <Text style={styles.sectionTitle}>Policy & Rules</Text>
        <InfoCard type={InfoCardType.POLICY} />
      </ScrollView>
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  cardMargin: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cleanBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cleanTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.ink,
  },
  cleanSub: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    marginTop: 2,
  },
  offenseList: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
