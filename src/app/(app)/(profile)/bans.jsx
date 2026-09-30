import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import EmptyState from '@/components/shell/EmptyState';
import InfoCard from '@/components/shell/InfoCard';
import ListRow from '@/components/shell/ListRow';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';

import {
  BANS_COPY, COLORS, EmptyStateType, IconSet, InfoCardType, ListRowType, OFFENSE_LABEL, OffenseState, RULES, SPACING,
  TYPOGRAPHY,
} from '@/constants';
import { usePreview } from '@/dev/previews'; // DEV-PREVIEW
import { useNow, usePenaltyRecord } from '@/hooks';
import { formatDate, formatTime } from '@/utils';

// S15 Bans & Warnings — read from offense records (UIUX §4.13, §5.8).

function offenseState(offense) {
  if (offense.revoked_at) return OffenseState.REVOKED;
  if (offense.resulted_in_ban) return OffenseState.CAUSED_BAN;
  return OffenseState.ACTIVE;
}

export default function BansScreen() {
  const router = useRouter();
  const now = useNow(60000);
  const liveRecord = usePenaltyRecord();
  const preview = usePreview('bans'); // DEV-PREVIEW
  const { strikeCount, bannedUntil, offenses } = preview.data ?? liveRecord; // DEV-PREVIEW

  const banned = !!bannedUntil && new Date(bannedUntil).getTime() > now;
  // The ban's causes are the latest unrevoked offenses that filled the meter, listed oldest first
  const banCauses = offenses.filter((o) => !o.revoked_at).slice(0, RULES.OFFENSES_PER_BAN).reverse();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  return (
    <View style={styles.screen}>
      <SubHeader title="Bans & Warnings" onBack={goBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {preview.bar /* DEV-PREVIEW */}

        {banned ? (
          <InfoCard
            type={InfoCardType.BAN_BANNER}
            title={BANS_COPY.bannedUntil(formatTime(bannedUntil))}
            items={banCauses.map((o) => ({ label: OFFENSE_LABEL[o.type], ticket: o.ticket_number }))}
          />
        ) : (
          <InfoCard type={InfoCardType.STRIKE_METER} strikes={strikeCount} />
        )}

        <InfoCard type={InfoCardType.POLICY} />

        <SectionLabel text={BANS_COPY.historyLabel} />

        {offenses.length ? (
          offenses.map((o) => (
            <ListRow
              key={o.id}
              type={ListRowType.OFFENSE}
              title={OFFENSE_LABEL[o.type]}
              subtitle={`${formatDate(o.created_at)} · ${o.ticket_number}`}
              status={offenseState(o)}
            />
          ))
        ) : (
          <EmptyState type={EmptyStateType.CLEAN_RECORD} />
        )}

        <Pressable
          onPress={() => router.push('/help')}
          style={({ pressed }) => [styles.policyLink, pressed && styles.pressed]}
          accessibilityRole="link"
        >
          <Text style={styles.policyText}>{BANS_COPY.policyLink}</Text>
          <IconSet name="arrow-forward" size={14} color={COLORS.deepGold} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: SPACING.xxs,
    paddingVertical: SPACING.xl,
  },
  pressed: { opacity: 0.7 },
  policyText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.deepGold,
  },
});
