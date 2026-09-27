import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Button from "@/components/primitives/Button";
import Input from "@/components/primitives/Input";
import SearchInput from "@/components/primitives/SearchInput";
import Picker from "@/components/primitives/Picker";
import Toggle from "@/components/primitives/Toggle";
import { ButtonType, ToggleType, InputType } from '@/theme/types';
import theme from '@/theme/theme';
import Badge from "@/components/shell/Badge";
import Header from "@/components/shell/Header";
import BottomNav from "@/components/shell/BottomNav";
import ModalShell from "@/components/shell/ModalShell";
import Queue from './(tabs)/queue';

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState(null);
  const [guestType, setGuestType] = useState(null);

  return (
    <>
    <Queue />
    {/*
    <View style={styles.screen}>
      <Header title="HOME" hasNotification onBellPress={() => {}} onAvatarPress={() => {}} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Shell preview</Text>
        <View style={styles.badgeGrid}>
          <Badge status="waiting" />
          <Badge status="yourTurn" />
          <Badge status="expired" />
          <Badge status="inService" />
          <Badge status="completed" />
          <Badge status="cancelled" />
          <Badge status="noShow" />
        </View>

        <Text style={styles.sectionTitle}>Primitive preview</Text>
        <View style={styles.previewCard}>
          <Button type={ButtonType.PRIMARY} label="Open modal" onPress={() => setModalVisible(true)} />
          <Button type={ButtonType.SECONDARY} label="Secondary" onPress={() => {}} />
          <Button type={ButtonType.DESTRUCTIVE} label="Delete" onPress={() => {}} />
          <Button type={ButtonType.DISABLED} label="Disabled" onPress={() => {}} />

          <Toggle
            title="Push notifications"
            subtitle="In-app alerts stay live while push notifications are enabled."
            toggled={pushEnabled}
            onToggleChange={setPushEnabled}
          />

          <Toggle
            title="Biometric login"
            subtitle="Not available in this version."
            type={ToggleType.DISABLED}
            toggled={false}
            onToggleChange={() => {}}
          />

          <Input
            value={studentId}
            onChangeText={setStudentId}
            placeholder="Student ID"
            type={InputType.DEFAULT}
          />

          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
          />

          <Picker
            searchable
            placeholder="Search programs"
            options={['Computer Science', 'Information Technology', 'Data Science and Analytics']}
            value={program}
            onSelect={setProgram}
          />

          <Picker
            placeholder="Select guest type"
            options={['Parent or Guardian', 'Relative', 'Representative', 'Alumni', 'Other']}
            value={guestType}
            onSelect={setGuestType}
          />
        </View>
      </ScrollView>

      <BottomNav active="home" onNavigate={() => {}} />

      <ModalShell visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={styles.modalTitle}>Modal preview</Text>
        <Text style={styles.modalText}>This screen loads the shared shell and primitive components together for design review.</Text>
      </ModalShell>
    </View>
    */}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    backgroundColor: theme.colors.paper,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
    marginBottom: 12,
  },
  badgeGrid: {
    gap: 12,
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  modalTitle: {
    fontSize: theme.typography.size.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
    marginBottom: 8,
  },
  modalText: {
    fontSize: theme.typography.size.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.slate,
    lineHeight: 20,
  },
});