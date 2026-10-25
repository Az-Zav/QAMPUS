import ActionButton from '@/components/primitives/ActionButton';
import FilterSelect from '@/components/primitives/FilterSelect';
import { LogRow } from '@/components/records/RecordRow';
import ConsolePage from '@/components/shell/ConsolePage';
import EmptyState from '@/components/shell/EmptyState';
import PageHeader from '@/components/shell/PageHeader';
import {
  ACTIVITY_ACTION,
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_LOG_COPY,
  ButtonType,
  EMPTY_COPY,
  FOOTER_COPY,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';
import { useActivityLog, useStaffOffice, useThemedStyles } from '@/hooks';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ACTION_OPTIONS = [
  { key: null, label: ACTIVITY_LOG_COPY.allActions },
  ...Object.values(ACTIVITY_ACTION).map((action) => ({ key: action, label: ACTIVITY_ACTION_LABEL[action] })),
];
const RANGE_OPTIONS = ACTIVITY_LOG_COPY.dateRanges;

// W05 — Activity Log: every action affecting someone's place in line (R-28), with full ticket
// numbers, actor and reason. Filters: action type and date.
export default function ActivityLog() {
  const styles = useThemedStyles(makeStyles);
  const { office } = useStaffOffice();
  const [action, setAction] = useState(null);
  const [rangeKey, setRangeKey] = useState(RANGE_OPTIONS[0].key);
  const range = RANGE_OPTIONS.find((option) => option.key === rangeKey);
  const { entries, rangeLabel, hasNewer, hasOlder, newer, older } = useActivityLog({ action, days: range.days });

  return (
    <ConsolePage topSpacing={44} footer={{ center: FOOTER_COPY.logScope(office), right: FOOTER_COPY.logNote }}>
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
              <ActionButton
                label={ACTIVITY_LOG_COPY.newer}
                type={ButtonType.SECONDARY}
                disabled={!hasNewer}
                onPress={newer}
                style={styles.pagerButton}
              />
              <ActionButton
                label={ACTIVITY_LOG_COPY.older}
                type={ButtonType.SECONDARY}
                disabled={!hasOlder}
                onPress={older}
                style={styles.pagerButton}
              />
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
    pagerButton: { height: 36, paddingHorizontal: 16 },
  });
