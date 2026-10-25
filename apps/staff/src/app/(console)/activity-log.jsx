import FilterSelect from '@/components/primitives/FilterSelect';
import { LogRow } from '@/components/records/RecordRow';
import ConsolePage from '@/components/shell/ConsolePage';
import EmptyState from '@/components/shell/EmptyState';
import PageHeader from '@/components/shell/PageHeader';
import {
  ACTIVITY_ACTION,
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_LOG_COPY,
  EMPTY_COPY,
  FOOTER_COPY,
  RADII,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';
import { useActivityLog, useStaffOffice, useTheme, useThemedStyles } from '@/hooks';
import { ChevronLeft, ChevronRight } from '@/icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ACTION_OPTIONS = [
  { key: null, label: ACTIVITY_LOG_COPY.allActions },
  ...Object.values(ACTIVITY_ACTION).map((action) => ({ key: action, label: ACTIVITY_ACTION_LABEL[action] })),
];
const RANGE_OPTIONS = ACTIVITY_LOG_COPY.dateRanges;

// W05 — Activity Log: every action affecting someone's place in line (R-28), with full ticket
// numbers, actor and reason. Filters: action type and date.
export default function ActivityLog() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { office } = useStaffOffice();
  const [action, setAction] = useState(null);
  const [rangeKey, setRangeKey] = useState(RANGE_OPTIONS[0].key);
  const range = RANGE_OPTIONS.find((option) => option.key === rangeKey);
  const { entries, rangeLabel, hasNewer, hasOlder, newer, older } = useActivityLog({ action, days: range.days });

  return (
    <ConsolePage topSpacing={44} footer={{ center: FOOTER_COPY.logScope(office) }}>
      <PageHeader title={ACTIVITY_LOG_COPY.title} subtitle={ACTIVITY_LOG_COPY.subtitle(office)}>
        <View style={styles.filters}>
          <FilterSelect
            options={ACTION_OPTIONS}
            value={action}
            onChange={setAction}
            width={190}
            accessibilityLabel="Filter by action"
          />
          <FilterSelect
            options={RANGE_OPTIONS}
            value={rangeKey}
            onChange={setRangeKey}
            width={150}
            accessibilityLabel="Filter by date"
          />
        </View>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState {...EMPTY_COPY.noRecords} />
      ) : (
        <>
          <View style={styles.pager}>
            <Text style={styles.count}>{ACTIVITY_LOG_COPY.pageSummary(range.label, rangeLabel)}</Text>
            <View style={styles.pagerButtons}>
              <Pressable
                onPress={newer}
                disabled={!hasNewer}
                accessibilityRole="button"
                accessibilityLabel={ACTIVITY_LOG_COPY.newer}
                accessibilityState={{ disabled: !hasNewer }}
                style={[styles.arrow, !hasNewer && styles.arrowDisabled]}
              >
                <ChevronLeft size={18} color={colors.ink} />
              </Pressable>
              <Pressable
                onPress={older}
                disabled={!hasOlder}
                accessibilityRole="button"
                accessibilityLabel={ACTIVITY_LOG_COPY.older}
                accessibilityState={{ disabled: !hasOlder }}
                style={[styles.arrow, !hasOlder && styles.arrowDisabled]}
              >
                <ChevronRight size={18} color={colors.ink} />
              </Pressable>
            </View>
          </View>
          {entries.map((entry) => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </>
      )}
    </ConsolePage>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    filters: { flexDirection: 'row', gap: 12 },
    count: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    pagerButtons: { flexDirection: 'row', gap: 8 },
    arrow: { padding: 8, borderRadius: RADII.full, borderWidth: 1, borderColor: c.slate },
    arrowDisabled: { opacity: 0.35 },
  });
