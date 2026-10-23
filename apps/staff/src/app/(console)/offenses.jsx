
import StaffModal, {
  ModalField,
} from '@/components/modals/StaffModal';

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
  createEmptyReasonSelection,
  REASON_ACTION,
  REASON_ERROR_MESSAGES,
  ReasonValidationResult,
  validateReasonSelection,
} from '@/constants/reasons';

import {
  useOffenses,
  useStaffOffice,
  useThemedStyles,
} from '@/hooks';

import { useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

// =====================================================
// QAMPUS STAFF WEB — OFFENSES
//
// Fix #2: Penalty and ban calculations
// New: Required multi-select revocation reasons
//
// All operations currently use frontend mock state.
// =====================================================

export default function Offenses() {
  const styles = useThemedStyles(makeStyles);

  const { office } = useStaffOffice();

  // Existing search state.
  const [search, setSearch] = useState('');

  // Offense being revoked.
  const [revoking, setRevoking] = useState(null);

  // Shared modal error state.
  const [error, setError] = useState(null);

  // New structured reason selection state.
  const [
    reasonSelection,
    setReasonSelection,
  ] = useState(createEmptyReasonSelection);

  // Existing offense data and penalty summaries.
  const {
    offenses,
    total,
    summary,
    revokeOffense,
  } = useOffenses(search);

  // Existing QAMPUS confirmation copy.
  const copy = MODAL_COPY.revokeOffense();

  // =====================================================
  // MODAL HELPERS
  // =====================================================

  // Open the revocation modal.
  const startRevoke = (offense) => {
    // Revoked offenses cannot be revoked again.
    if (offense.revoked_at) {
      return;
    }

    setRevoking(offense);

    // Each revocation begins with a new reason selection.
    setReasonSelection(createEmptyReasonSelection());

    setError(null);
  };

  // Close the revocation modal.
  const closeRevoke = () => {
    setRevoking(null);
    setReasonSelection(createEmptyReasonSelection());
    setError(null);
  };

  // Update controlled reason fields.
  const handleReasonChange = (selection) => {
    setReasonSelection(selection);
    setError(null);
  };

  // =====================================================
  // OFFENSE REVOCATION
  //
  // Requirements:
  // - At least one reason
  // - Multiple reasons supported
  // - Other may be combined with predefined reasons
  // - Other explanation required when selected
  // - Optional additional notes
  // - Maximum 200 characters per text field
  // =====================================================

  const handleRevoke = () => {
    if (!revoking?.id) {
      setError('No offense was selected for revocation.');
      return;
    }

    // Validate before dispatching to QueueProvider.
    const validation = validateReasonSelection(
      REASON_ACTION.OFFENSE_REVOCATION,
      reasonSelection,
    );

    if (validation !== ReasonValidationResult.OK) {
      setError(
        REASON_ERROR_MESSAGES[validation] ??
          'Please select a valid reason.',
      );
      return;
    }

    // File 6 will accept the structured selection,
    // validate it again, and log the chosen reasons.
    const result = revokeOffense(
      revoking.id,
      reasonSelection,
    );

    // The frontend provider previously returned
    // undefined for revocation. File 6 introduces
    // explicit result codes.
    if (result !== 'ok') {
      const errors = {
        invalidReason:
          'Please check the selected reasons.',
        offenseNotFound:
          'This offense could not be found.',
        alreadyRevoked:
          'This offense has already been revoked.',
      };

      setError(
        errors[result] ??
          'Unable to revoke this offense.',
      );
      return;
    }

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
      {/* ============================================
          PAGE HEADER AND SEARCH
      ============================================ */}

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

      {/* ============================================
          PENALTY SUMMARY — FIX #2 PRESERVED
      ============================================ */}

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

      {/* ============================================
          OFFENSE RECORDS
      ============================================ */}

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

      {/* ============================================
          OFFENSE REVOCATION MODAL
      ============================================ */}

      <StaffModal
        visible={!!revoking}
        {...copy}
        field={ModalField.REASON_SELECT}

        reasonAction={
          REASON_ACTION.OFFENSE_REVOCATION
        }
        reasonSelection={reasonSelection}
        onReasonSelectionChange={
          handleReasonChange
        }

        error={error}
        cancelLabel={copy.cancel}
        confirmLabel={copy.confirm}
        destructive
        onCancel={closeRevoke}
        onConfirm={handleRevoke}
      />
    </ConsolePage>
  );
}

// =====================================================
// STYLES
// =====================================================

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
