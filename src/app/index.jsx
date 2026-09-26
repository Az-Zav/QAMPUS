import { View, StyleSheet } from "react-native";
import Button from "../components/primitives/Button";
import { ButtonType } from '../theme/types';

export default function Index() {
  return (
    <View style={styles.container}>
      <Button type={ButtonType.PRIMARY} label="Confirm" onPress={() => {}} />
      <Button type={ButtonType.SECONDARY} label="Cancel" onPress={() => {}} />
      <Button type={ButtonType.DESTRUCTIVE} label="Cancel ticket" onPress={() => {}} />
      <Button type={ButtonType.DISABLED} label="Join" onPress={() => {}} />
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