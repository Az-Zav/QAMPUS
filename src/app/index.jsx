import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import Button from "../components/primitives/Button";
import Input from "../components/primitives/Input";
import Picker from "../components/primitives/Picker";
import SearchInput from "../components/primitives/SearchInput";
import Toggle from "../components/primitives/Toggle";
import theme from '../theme/theme';
import { ButtonType, InputType, ToggleType } from '../theme/types';

export default function Index() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState(null);
  const [guestType, setGuestType] = useState(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Button type={ButtonType.PRIMARY} label="Confirm" onPress={() => {}} />
      <Button type={ButtonType.SECONDARY} label="Cancel" onPress={() => {}} />
      <Button type={ButtonType.DESTRUCTIVE} label="Cancel ticket" onPress={() => {}} />
      <Button type={ButtonType.DISABLED} label="Join" onPress={() => {}} />
      <Toggle
        title="Push notifications"
        subtitle="In-app notifications always persist. Push is used for your turn."
        toggled={pushEnabled}
        onToggleChange={setPushEnabled}
      />
      <Toggle
        title="Biometric login"
        subtitle="Not available in this version."
        type={ToggleType.DISABLED}
        toggled={false}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
});