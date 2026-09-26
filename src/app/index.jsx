import { View, StyleSheet } from "react-native";
import Button from "../components/primitives/Button";

export default function Index() {
  return (
    <View style={styles.container}>
      <Button kind="primary" label="Confirm" onPress={() => {}} />
      <Button kind="secondary" label="Cancel" onPress={() => {}} />
      <Button kind="destructive" label="Cancel ticket" onPress={() => {}} />
      <Button kind="disabled" label="Join" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
});