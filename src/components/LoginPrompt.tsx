import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function LoginPrompt({
  message,
  redirectTo,
}: {
  message: string;
  redirectTo: string;
}) {
  const router = useRouter();

  return (
    <View style={styles.center}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttons}>
        <Button
          title="Login"
          onPress={() =>
            router.push({ pathname: "/(auth)/login", params: { redirectTo } })
          }
        />
        <Button
          title="Register"
          onPress={() =>
            router.push({
              pathname: "/(auth)/register",
              params: { redirectTo },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: theme.colors.text,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
}));
