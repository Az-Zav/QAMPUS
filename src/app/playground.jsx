/**
 * PLAYGROUND — dev-only gallery. Pick a component from the chip bar to see
 * every variant of it. Open at /playground.
 */

import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import Button from '@/components/primitives/Button';
import FormField from '@/components/primitives/FormField';
import Input from '@/components/primitives/Input';
import PageDots from '@/components/primitives/PageDots';
import Picker from '@/components/primitives/Picker';
import SearchInput from '@/components/primitives/SearchInput';
import SegmentedSwitcher from '@/components/primitives/SegmentedSwitcher';
import Toggle from '@/components/primitives/Toggle';
import JoinConfirmModal from '@/components/queue/JoinConfirmModal';
import OfficeCard from '@/components/queue/OfficeCard';
import Badge from '@/components/shell/Badge';
import BottomNav from '@/components/shell/BottomNav';
import ConfirmModal from '@/components/shell/ConfirmModal';
import DetailRow from '@/components/shell/DetailRow';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import InfoCard from '@/components/shell/InfoCard';
import ListRow from '@/components/shell/ListRow';
import NoticeModal from '@/components/shell/NoticeModal';
import SubHeader from '@/components/shell/SubHeader';
import CalledModal from '@/components/tickets/CalledModal';
import TicketModal from '@/components/tickets/TicketModal';
import TicketStubCard from '@/components/tickets/TicketStubCard';
import {
  AppTab,
  ButtonType,
  COLORS,
  ComponentSize,
  EmptyStateType,
  FAQ_ITEMS,
  IconSet,
  InfoCardType,
  InputType,
  ListRowTone,
  ListRowType,
  ModalTone,
  OffenseState,
  ONBOARDING_SLIDES,
  RADII,
  SPACING,
  TicketStatus,
  TYPOGRAPHY,
} from '@/constants';
import { useMyTickets, useOffices } from '@/hooks';

const noop = () => {};

// Labelled wrapper for one variant
function Variant({ label, children }) {
  return (
    <View style={styles.variant}>
      <Text style={styles.variantLabel}>{label}</Text>
      {children}
    </View>
  );
}

// Button that opens a modal variant
function ModalTrigger({ label, onPress }) {
  return <Button type={ButtonType.SECONDARY} label={label} onPress={onPress} />;
}

// ---------------------------------------------------------------------------
// One demo per component. Each receives the live mock views (active, offices).
// ---------------------------------------------------------------------------

function ButtonDemo() {
  return (
    <>
      {Object.values(ButtonType).map((type) => (
        <Variant key={type} label={`type={ButtonType.${type.toUpperCase()}}`}>
          <Button type={type} label={type} onPress={noop} />
        </Variant>
      ))}
      <Variant label="disabled">
        <Button label="Disabled" disabled onPress={noop} />
      </Variant>
      <Variant label="size={ComponentSize.SM}">
        <Button label="Small" size={ComponentSize.SM} onPress={noop} />
      </Variant>
      <Variant label="icon={<IconSet ... />}">
        <Button label="With icon" type={ButtonType.SECONDARY} icon={<IconSet name="logo-google" size={20} color={COLORS.ink} />} onPress={noop} />
      </Variant>
    </>
  );
}

function BadgeDemo() {
  return (
    <>
      {Object.values(TicketStatus).map((status) => (
        <Variant key={status} label={`status="${status}"`}>
          <View style={styles.row}>
            <Badge status={status} />
            <Badge status={status} size={ComponentSize.MD} />
          </View>
        </Variant>
      ))}
      <Variant label="action badge: icon + label + onPress">
        <View style={styles.row}>
          <Badge icon="qr-code" label="Open scanner" onPress={noop} />
        </View>
      </Variant>
    </>
  );
}

function InputDemo() {
  const [value, setValue] = useState('');
  return (
    <>
      <Variant label="default">
        <Input value={value} onChangeText={setValue} placeholder="Student ID" keyboardType="number-pad" maxLength={7} />
      </Variant>
      <Variant label="type={InputType.ERROR}">
        <Input placeholder="Error state" type={InputType.ERROR} />
      </Variant>
      <Variant label="disabled">
        <Input value="2140123" disabled />
      </Variant>
    </>
  );
}

function FormFieldDemo() {
  const [program, setProgram] = useState(null);
  return (
    <>
      <Variant label="label + Input">
        <FormField label="Full name">
          <Input placeholder="Maria Santos" />
        </FormField>
      </Variant>
      <Variant label="helper">
        <FormField label="Student ID" helper="Exactly 7 digits.">
          <Input placeholder="2512269" keyboardType="number-pad" maxLength={7} />
        </FormField>
      </Variant>
      <Variant label="error (replaces helper)">
        <FormField label="Student ID" helper="Exactly 7 digits." error="Enter exactly 7 digits.">
          <Input value="25122" type={InputType.ERROR} />
        </FormField>
      </Variant>
      <Variant label="wrapping a Picker">
        <FormField label="Program">
          <Picker value={program} onSelect={setProgram} options={['BS Computer Science', 'BS Architecture']} placeholder="Select your program" />
        </FormField>
      </Variant>
    </>
  );
}

function SearchInputDemo() {
  const [value, setValue] = useState('');
  return (
    <Variant label="default">
      <SearchInput value={value} onChangeText={setValue} placeholder="Search office or service" />
    </Variant>
  );
}

function PickerDemo() {
  const [program, setProgram] = useState(null);
  const options = ['Computer Science', 'Information Technology', 'Data Science and Analytics'];
  return (
    <>
      <Variant label="default">
        <Picker value={program} onSelect={setProgram} options={options} placeholder="Select a program" />
      </Variant>
      <Variant label="searchable">
        <Picker value={program} onSelect={setProgram} options={options} placeholder="Search programs" searchable />
      </Variant>
    </>
  );
}

function ToggleDemo() {
  const [on, setOn] = useState(true);
  return (
    <>
      <Variant label="value + onValueChange">
        <Toggle title="Push notifications" subtitle="Alerts when it's your turn" value={on} onValueChange={setOn} />
      </Variant>
      <Variant label="disabled">
        <Toggle title="Biometric login" subtitle="Coming soon" value={false} disabled />
      </Variant>
    </>
  );
}

function SegmentedSwitcherDemo() {
  const [value, setValue] = useState('Join');
  return (
    <Variant label="options + value + onChange">
      <SegmentedSwitcher options={['Join', 'History']} value={value} onChange={setValue} />
    </Variant>
  );
}

function HeaderDemo() {
  return (
    <>
      <Variant label="default">
        <Header title="HOME" hasNotification onBellPress={noop} onAvatarPress={noop} />
      </Variant>
      <Variant label="inverted (on gold hero)">
        <View style={styles.goldBackdrop}>
          <Header title="QUEUE" inverted onBellPress={noop} onAvatarPress={noop} />
        </View>
      </Variant>
    </>
  );
}

function SubHeaderDemo() {
  return (
    <>
      <Variant label="title + onBack">
        <SubHeader title="Help & Support" onBack={noop} />
      </Variant>
      <Variant label="long title (truncates to one line)">
        <SubHeader title="Notifications and announcement preferences" onBack={noop} />
      </Variant>
    </>
  );
}

function BottomNavDemo() {
  const [active, setActive] = useState(AppTab.HOME);
  return (
    <Variant label="active + onNavigate">
      <View style={styles.navFrame}>
        <BottomNav active={active} onNavigate={setActive} />
      </View>
    </Variant>
  );
}

function DetailRowDemo() {
  return (
    <Variant label="label + value">
      <DetailRow label="Estimated wait" value="about 9 min" />
      <DetailRow label="People ahead" value={2} />
    </Variant>
  );
}

function EmptyStateDemo() {
  return (
    <>
      {Object.entries(EmptyStateType).map(([key, type]) => (
        <Variant key={type} label={`type={EmptyStateType.${key}}`}>
          <EmptyState type={type} onAction={noop} />
        </Variant>
      ))}
    </>
  );
}

function InfoCardDemo({ offices }) {
  return (
    <>
      <Variant label="OFFICE_HOURS (open / closed)">
        {offices.slice(1, 3).map((office) => (
          <InfoCard
            key={office.id}
            type={InfoCardType.OFFICE_HOURS}
            title={office.name}
            subtitle={office.location}
            hours={office.hours}
            open={office.open}
            onPress={noop}
          />
        ))}
      </Variant>
      <Variant label="STRIKE_METER strikes={0} / {1}">
        <InfoCard type={InfoCardType.STRIKE_METER} strikes={0} />
        <InfoCard type={InfoCardType.STRIKE_METER} strikes={1} />
      </Variant>
      <Variant label="BAN_BANNER (shown instead of the strike meter while banned)">
        <InfoCard
          type={InfoCardType.BAN_BANNER}
          title="Joining paused until 3:00 PM tomorrow"
          items={[
            { label: 'No-show', ticket: 'C-09-25-031' },
            { label: 'Cancelled after call', ticket: 'R-09-28-015' },
          ]}
        />
      </Variant>
      <Variant label="POLICY (OFFENSE_POLICY)">
        <InfoCard type={InfoCardType.POLICY} />
      </Variant>
      <Variant label="FAQ (FAQ_ITEMS) — tap to expand / collapse">
        {FAQ_ITEMS.map((item, i) => (
          <InfoCard key={item.id} type={InfoCardType.FAQ} title={item.question} body={item.answer} defaultExpanded={i === 0} />
        ))}
      </Variant>
    </>
  );
}

function ListRowDemo() {
  return (
    <>
      <Variant label="MENU (with pill / destructive)">
        <ListRow type={ListRowType.MENU} title="Edit profile" icon="person-outline" onPress={noop} />
        <ListRow type={ListRowType.MENU} title="Bans & warnings" icon="warning-outline" pill="1" onPress={noop} />
        <ListRow type={ListRowType.MENU} title="Sign out" icon="log-out-outline" destructive onPress={noop} />
      </Variant>
      <Variant label="NOTIFICATION (each tone, unread)">
        {Object.values(ListRowTone).map((tone, i) => (
          <ListRow
            key={tone}
            type={ListRowType.NOTIFICATION}
            title={`tone="${tone}"`}
            subtitle="Ticket R-015 has been called."
            meta="2m"
            icon="notifications"
            tone={tone}
            unread={i === 0}
          />
        ))}
      </Variant>
      <Variant label="OFFENSE (each OffenseState)">
        {Object.values(OffenseState).map((state) => (
          <ListRow key={state} type={ListRowType.OFFENSE} title="No-show" subtitle="C-09-25-031 · Sep 25" status={state} />
        ))}
      </Variant>
      <Variant label="HISTORY (each terminal TicketStatus)">
        {[TicketStatus.COMPLETED, TicketStatus.CANCELLED, TicketStatus.CANCELLED_BY_OFFICE, TicketStatus.NO_SHOW].map((status) => (
          <ListRow
            key={status}
            type={ListRowType.HISTORY}
            title="R-09-26-009"
            subtitle="Office of the University Registrar"
            meta="Sep 26, 2:12 PM"
            status={status}
          />
        ))}
      </Variant>
    </>
  );
}

function TicketStubCardDemo({ active }) {
  const base = active[1] ?? active[0];
  return (
    <>
      <Variant label="live mock tickets">
        {active.map((ticket) => (
          <TicketStubCard key={ticket.id} ticket={ticket} onPress={noop} onOpenScanner={noop} />
        ))}
      </Variant>
      {[TicketStatus.WAITING, TicketStatus.YOUR_TURN, TicketStatus.EXPIRED, TicketStatus.IN_SERVICE].map((status) => (
        <Variant key={status} label={`status="${status}"`}>
          <TicketStubCard
            ticket={{ ...base, status, remainingSeconds: status === TicketStatus.YOUR_TURN ? 42 : status === TicketStatus.EXPIRED ? 0 : null }}
            onPress={noop}
            onOpenScanner={noop}
          />
        </Variant>
      ))}
    </>
  );
}

function OfficeCardDemo({ offices }) {
  return (
    <>
      <Variant label="open / closed">
        {offices.slice(1, 3).map((office) => (
          <OfficeCard key={office.id} office={office} onJoin={noop} />
        ))}
      </Variant>
      <Variant label="joinDisabled + disabledReason">
        <OfficeCard office={{ ...offices[0], joinDisabled: true, disabledReason: 'You already hold 3 active tickets.' }} onJoin={noop} />
      </Variant>
    </>
  );
}

function ModalsDemo({ active, offices }) {
  const [modal, setModal] = useState(null);
  const close = () => setModal(null);
  const base = active[1] ?? active[0];

  const ticketVariants = {
    'ticket-waiting': { ...base, status: TicketStatus.WAITING, remainingSeconds: null },
    'ticket-yourTurn': { ...base, status: TicketStatus.YOUR_TURN, remainingSeconds: 42 },
    'ticket-expired': { ...base, status: TicketStatus.EXPIRED, remainingSeconds: 0 },
    'ticket-inService': { ...base, status: TicketStatus.IN_SERVICE, remainingSeconds: null },
  };

  return (
    <>
      <Variant label="TicketModal (per status)">
        {Object.keys(ticketVariants).map((key) => (
          <ModalTrigger key={key} label={key} onPress={() => setModal(key)} />
        ))}
      </Variant>
      <Variant label="CalledModal">
        <ModalTrigger label="It's your turn" onPress={() => setModal('called')} />
      </Variant>
      <Variant label="JoinConfirmModal">
        <ModalTrigger label="Join this queue?" onPress={() => setModal('join')} />
      </Variant>
      <Variant label="ConfirmModal (default / destructive)">
        <ModalTrigger label="Cancel waiting ticket" onPress={() => setModal('confirm')} />
        <ModalTrigger label="Cancel called ticket" onPress={() => setModal('confirm-destructive')} />
      </Variant>
      <Variant label="NoticeModal (default / destructive / no button)">
        <ModalTrigger label="Queue closed" onPress={() => setModal('notice')} />
        <ModalTrigger label="Banned" onPress={() => setModal('notice-destructive')} />
        <ModalTrigger label="No button" onPress={() => setModal('notice-bare')} />
      </Variant>

      {Object.entries(ticketVariants).map(([key, ticket]) => (
        <TicketModal key={key} visible={modal === key} ticket={ticket} onClose={close} onCancel={close} onOpenScanner={close} />
      ))}
      <CalledModal visible={modal === 'called'} ticket={ticketVariants['ticket-yourTurn']} onClose={close} onOpenScanner={close} />
      <JoinConfirmModal visible={modal === 'join'} office={offices[0]} onClose={close} onConfirm={close} />
      <ConfirmModal
        visible={modal === 'confirm'}
        icon="ticket-outline"
        title="Leave this queue?"
        body="You haven't been called yet, so leaving is free."
        confirmLabel="Leave queue"
        cancelLabel="Stay in line"
        onConfirm={close}
        onClose={close}
      />
      <ConfirmModal
        visible={modal === 'confirm-destructive'}
        tone={ModalTone.DESTRUCTIVE}
        icon="warning-outline"
        title="Cancel called ticket?"
        body="You've already been called. Cancelling now counts as an offense."
        rows={[{ label: 'Offenses after this', value: '1 of 2' }]}
        confirmLabel="Cancel ticket"
        cancelLabel="Keep ticket"
        onConfirm={close}
        onClose={close}
      />
      <NoticeModal
        visible={modal === 'notice'}
        title="Queue closed"
        body="This queue is closed. It opens again tomorrow at 8:00 AM."
        buttonLabel="Got it"
        onClose={close}
      />
      <NoticeModal
        visible={modal === 'notice-destructive'}
        tone={ModalTone.DESTRUCTIVE}
        icon="ban-outline"
        title="Joining paused"
        body="You have 2 offenses. You can join queues again tomorrow at 3:00 PM."
        rows={[{ label: 'Ban ends', value: 'Tomorrow, 3:00 PM' }]}
        buttonLabel="Understood"
        onClose={close}
      />
      <NoticeModal
        visible={modal === 'notice-bare'}
        icon="checkmark-circle-outline"
        title="Checked in"
        body="You're now in service. Head to the window."
        onClose={close}
      />
    </>
  );
}

function PageDotsDemo() {
  return [0, 1, 2].map((i) => (
    <Variant key={i} label={`count={3} index={${i}}`}>
      <PageDots count={3} index={i} />
    </Variant>
  ));
}

function OnboardingSlideDemo() {
  const { width } = useWindowDimensions();
  return ONBOARDING_SLIDES.map((slide) => (
    <Variant key={slide.id} label={`slide "${slide.id}"`}>
      <View style={styles.slideFrame}>
        <OnboardingSlide slide={slide} width={width - SPACING.lg * 2} />
      </View>
    </Variant>
  ));
}

// Order of the chip bar
const DEMOS = [
  { name: 'Button', Demo: ButtonDemo },
  { name: 'Badge', Demo: BadgeDemo },
  { name: 'Input', Demo: InputDemo },
  { name: 'FormField', Demo: FormFieldDemo },
  { name: 'SearchInput', Demo: SearchInputDemo },
  { name: 'Picker', Demo: PickerDemo },
  { name: 'Toggle', Demo: ToggleDemo },
  { name: 'SegmentedSwitcher', Demo: SegmentedSwitcherDemo },
  { name: 'PageDots', Demo: PageDotsDemo },
  { name: 'Header', Demo: HeaderDemo },
  { name: 'SubHeader', Demo: SubHeaderDemo },
  { name: 'BottomNav', Demo: BottomNavDemo },
  { name: 'DetailRow', Demo: DetailRowDemo },
  { name: 'EmptyState', Demo: EmptyStateDemo },
  { name: 'InfoCard', Demo: InfoCardDemo },
  { name: 'ListRow', Demo: ListRowDemo },
  { name: 'TicketStubCard', Demo: TicketStubCardDemo },
  { name: 'OfficeCard', Demo: OfficeCardDemo },
  { name: 'Modals', Demo: ModalsDemo },
  { name: 'OnboardingSlide', Demo: OnboardingSlideDemo },
];

export default function Playground() {
  const { active } = useMyTickets();
  const { offices } = useOffices();
  const [selected, setSelected] = useState(DEMOS[0].name);

  if (!__DEV__) return <Redirect href="/" />;

  const { Demo } = DEMOS.find((d) => d.name === selected);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>Component Gallery</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipBar}>
        {DEMOS.map(({ name }) => (
          <Pressable
            key={name}
            onPress={() => setSelected(name)}
            style={[styles.chip, selected === name && styles.chipActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: selected === name }}
          >
            <Text style={[styles.chipText, selected === name && styles.chipTextActive]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Demo key={selected} active={active} offices={offices} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  heading: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  chipBar: {
    flexGrow: 0,
    marginVertical: SPACING.md,
  },
  chips: {
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.full,
    backgroundColor: COLORS.disabledBg,
  },
  chipActive: {
    backgroundColor: COLORS.ink,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.ink,
  },
  chipTextActive: {
    color: COLORS.gold,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge * 2,
    gap: SPACING.xl,
  },
  variant: {
    gap: SPACING.sm,
  },
  variantLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  goldBackdrop: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  slideFrame: {
    height: 420,
  },
  navFrame: {
    height: 110,
    backgroundColor: COLORS.disabledBg,
    borderRadius: RADII.lg,
  },
});
