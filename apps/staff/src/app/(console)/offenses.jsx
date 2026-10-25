
import StaffModal, {
  ModalField,
} from '@/components/modals/StaffModal';

import {
  createEmptyReasonSelection,
  isReasonComplete,
  REASON_ACTION,
  reasonToText,
} from '@/constants/reasons';

import SearchField from '@/components/primitives/SearchField';
import { OffenseRow } from '@/components/records/RecordRow';

import ConsolePage from '@/components/shell/ConsolePage';
import EmptyState from '@/components/shell/EmptyState';
import PageHeader from '@/components/shell/PageHeader';

import {
  EMPTY_COPY,
  FOOTER_COPY,
  MODAL_COPY,
  OFFENSES_COPY,
  STAFF_FONT,
  TYPOGRAPHY,
} from '@/constants';

import {
  useOffenses,
  useStaffOffice,
  useThemedStyles,
} from '@/hooks';

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// W04: Office offenses and calculated mock penalties.
export default function Offenses() {
  const styles = useThemedStyles(makeStyles);

  const { office } = useStaffOffice();

  const [search, setSearch] = useState('');
  const [revoking, setRevoking] = useState(null);
  const [reasons, setReasons] = useState(createEmptyReasonSelection);

  const {
    offenses,
    total,
    summary,
    revokeOffense,
  } = useOffenses(search);

  const copy = MODAL_COPY.revokeOffense();

  const startRevoke = (offense) => {
    if (offense.revoked_at) return;

    setReasons(createEmptyReasonSelection());
    setRevoking(offense);
  };

  const closeRevoke = () => {
    setRevoking(null);
    setReasons(createEmptyReasonSelection());
  };

  const handleRevoke = () => {
    if (!revoking?.id) return;

    revokeOffense(revoking.id, reasonToText(REASON_ACTION.OFFENSE_REVOCATION, reasons));
    closeRevoke();
  };

  return (
    <ConsolePage
      topSpacing={44}
      footer={{
        center: FOOTER_COPY.offensesScope(office),
        right: FOOTER_COPY.offensesNote,
      }}
    >
      <PageHeader
        title={OFFENSES_COPY.title}
        subtitle={OFFENSES_COPY.subtitle(office)}
      >
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={OFFENSES_COPY.search}
          style={styles.search}
        />
      </PageHeader>

      {/* Overall penalty summary */}
      {total > 0 && (
        <View style={styles.summary}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {summary.activeOffenses}
            </Text>

            <Text style={styles.statLabel}>
              Active offenses
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {summary.revokedOffenses}
            </Text>

            <Text style={styles.statLabel}>
              Revoked offenses
            </Text>
          </View>

          <View style={styles.stat}>
            <Text
              style={[
                styles.statValue,
                summary.bannedUsers > 0 &&
                  styles.warningValue,
              ]}
            >
              {summary.bannedUsers}
            </Text>

            <Text style={styles.statLabel}>
              Currently banned users
            </Text>
          </View>
        </View>
      )}

      {/* Offense records */}
      {total === 0 ? (
        <EmptyState {...EMPTY_COPY.noOffenses} />
      ) : offenses.length === 0 ? (
        <EmptyState {...EMPTY_COPY.noSearchResults} />
      ) : (
        <View style={styles.records}>
          <Text style={styles.count}>
            {OFFENSES_COPY.results(offenses.length)}
          </Text>

          {offenses.map((offense) => (
            <OffenseRow
              key={offense.id}
              offense={offense}
              onRevoke={() => startRevoke(offense)}
            />
          ))}
        </View>
      )}

      {/* Existing offense revocation modal */}
      <StaffModal
        visible={!!revoking}
        {...copy}
        field={ModalField.REASON_SELECT}
        reasonAction={REASON_ACTION.OFFENSE_REVOCATION}
        reasonSelection={reasons}
        onReasonSelectionChange={setReasons}
        confirmDisabled={!isReasonComplete(REASON_ACTION.OFFENSE_REVOCATION, reasons)}
        cancelLabel={copy.cancel}
        confirmLabel={copy.confirm}
        destructive
        onCancel={closeRevoke}
        onConfirm={handleRevoke}
      />
    </ConsolePage>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    search: {
      width: 362,
      maxWidth: '100%',
      marginRight: 58,
    },

    summary: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },

    stat: {
      minWidth: 160,
      flexGrow: 1,
      flexBasis: 160,
      padding: 18,
      gap: 8,
      backgroundColor: c.paper,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 12,
    },

    statValue: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: 28,
      color: c.ink,
    },

    statLabel: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.sm,
      color: c.slate,
    },

    warningValue: {
      color: c.error,
    },

    records: {
      gap: 12,
    },

    count: {
      fontFamily: STAFF_FONT.semibold,
      fontSize: TYPOGRAPHY.size.md,
      color: c.slate,
    },
  });
