import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function ErrorText({ message }: { message: string }) {
  return <Text style={styles.errorMessageText}>{message}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  errorMessageText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
}));
