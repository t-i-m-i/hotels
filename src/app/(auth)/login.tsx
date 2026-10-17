import { authClient } from "@/api/authClient";
import { ErrorText } from "@/components/ui/ErrorText";
import { type LoginForm, loginSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Login() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const goToRedirect = () => {
    router.replace((redirectTo as Href) ?? "/(guest)/(tabs)");
  };

  const onLogin = handleSubmit(async ({ email, password }) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      Alert.alert("Login failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  });

  const handleLoginGithub = async () => {
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
      Alert.alert("Login failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            testID="email-input"
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // optional password manager support
            textContentType="username" // ios
            autoComplete="username" // android
          />
        )}
      />
      {errors.email && <ErrorText message={errors.email.message!} />}
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            testID="password-input"
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // optional password manager support
            textContentType="password" // ios
            autoComplete="current-password" // android
          />
        )}
      />
      {errors.password && <ErrorText message={errors.password.message!} />}
      <Button
        testID="login-button"
        title="Login"
        onPress={onLogin}
        disabled={isSubmitting}
        color={theme.colors.primary}
      />
      <Button
        title="Continue with GitHub"
        onPress={handleLoginGithub}
        disabled={isSubmitting}
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
