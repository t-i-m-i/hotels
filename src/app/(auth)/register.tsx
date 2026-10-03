import { authClient } from "@/api/authClient";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Register() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const goToRedirect = () => {
    router.replace((redirectTo as Href) ?? "/(guest)/(tabs)");
  };

  const handleRegister = async () => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) {
      Alert.alert("Registration failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  };

  const handleRegisterGithub = async () => {
    // Without callbackURL, BetterAuth falls back to baseURL (bare
    // http://localhost:3000/, which has no route - 404). A relative path
    // here is converted to a "hotels://" deep link by the Expo client
    // plugin (src/api/authClient.ts), which is what lets the system
    // browser hand control back to the app once GitHub redirects back.
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: (redirectTo as string | undefined) ?? "/",
    });
    if (error) {
      Alert.alert("Registration failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={theme.colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Register"
        onPress={handleRegister}
        color={theme.colors.primary}
      />
      <Button
        title="Continue with GitHub"
        onPress={handleRegisterGithub}
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
