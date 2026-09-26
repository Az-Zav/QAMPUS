import { View, StyleSheet } from "react-native";
import { useState } from "react";
import Button from "../components/primitives/Button";
import Toggle from "../components/primitives/Toggle";
import { ButtonType, ToggleType } from '../theme/types';

export default function Index() {
const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <View style={styles.container}>
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
        type= {ToggleType.DISABLED}
        toggled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
});