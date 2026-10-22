import StaffModal, { ModalField } from '@/components/modals/StaffModal';
import SearchField from '@/components/primitives/SearchField';
import { OffenseRow } from '@/components/records/RecordRow';
import ConsolePage from '@/components/shell/ConsolePage';
import EmptyState from '@/components/shell/EmptyState';
import PageHeader from '@/components/shell/PageHeader';
import { EMPTY_COPY, FOOTER_COPY, MODAL_COPY, OFFENSES_COPY, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useOffenses, useStaffOffice, useThemedStyles } from '@/hooks';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

// W04 — Offenses: search by name, student ID or Guest ID; revoke an active offense (WM08, R-15).
// Scope: offenses tied to this office's tickets only.
export default function Offenses() {
  const styles = useThemedStyles(makeStyles);
  const { office } = useStaffOffice();
  const [search, setSearch] = useState('');
  const { offenses, total, revokeOffense } = useOffenses(search);
  const [revoking, setRevoking] = useState(null);
  const [reason, setReason] = useState('');
  const copy = MODAL_COPY.revokeOffense();

  const startRevoke = (offense) => {
    setReason('');
    setRevoking(offense);
  };

  return (
    <ConsolePage
      topSpacing={44}
      footer={{ center: FOOTER_COPY.offensesScope(office), right: FOOTER_COPY.offensesNote }}
    >
      <PageHeader title={OFFENSES_COPY.title} subtitle={OFFENSES_COPY.subtitle(office)}>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={OFFENSES_COPY.search}
          style={styles.search}
        />
      </PageHeader>

      {total === 0 ? (
        <EmptyState {...EMPTY_COPY.noOffenses} />
      ) : offenses.length === 0 ? (
        <EmptyState {...EMPTY_COPY.noSearchResults} />
      ) : (
        <>
          <Text style={styles.count}>{OFFENSES_COPY.results(offenses.length)}</Text>
          {offenses.map((offense) => (
            <OffenseRow key={offense.id} offense={offense} onRevoke={() => startRevoke(offense)} />
          ))}
        </>
      )}

      <StaffModal
        visible={!!revoking}
        {...copy}
        field={ModalField.REASON}
        value={reason}
        onChangeText={setReason}
        cancelLabel={copy.cancel}
        confirmLabel={copy.confirm}
        destructive
        onCancel={() => setRevoking(null)}
        onConfirm={() => {
          // `?.`: the React Compiler memoizes on this read, which must not throw while closed
          revokeOffense(revoking?.id, reason.trim()); // the reason is optional
          setRevoking(null);
        }}
      />
    </ConsolePage>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    search: { width: 362, maxWidth: '100%', marginRight: 58 },
    count: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.slate },
  });
