import { authClient } from "@/api/authClient";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Login() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goToRedirect = () => {
    router.replace((redirectTo as Href) ?? "/(tabs)");
  };

  const handleLogin = async () => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      Alert.alert("Login failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  };

  const handleLoginGithub = async () => {
    const { error } = await authClient.signIn.social({ provider: "github" });
    if (error) {
      Alert.alert("Login failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  };

  return (
    <View style={styles.container}>
      <TextInput
        testID="email-input"
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        testID="password-input"
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        testID="login-button"
        title="Login"
        onPress={handleLogin}
        color={theme.colors.primary}
      />
      <Button
        title="Continue with GitHub"
        onPress={handleLoginGithub}
        color={theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.background,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
}));
