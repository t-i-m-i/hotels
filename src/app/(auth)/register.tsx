import { authClient } from "@/api/authClient";
import { ErrorText } from "@/components/ui/ErrorText";
import { type RegisterForm, registerSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Register() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const goToRedirect = () => {
    router.replace((redirectTo as Href) ?? "/(guest)/(tabs)");
  };

  const onRegister = handleSubmit(async ({ name, email, password }) => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    if (error) {
      Alert.alert("Registration failed", error.message ?? "Please try again.");
      return;
    }
    goToRedirect();
  });

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
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={theme.colors.textMuted}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            textContentType="name" // ios
            autoComplete="name" // android
          />
        )}
      />
      {errors.name && <ErrorText message={errors.name.message!} />}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // optional password manager support
            textContentType="username" // ios -  iOS pairs a newPassword field with a username field to decide which account to save
            autoComplete="username" // android
          />
        )}
      />
      {errors.email && <ErrorText message={errors.email.message!} />}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // optional password manager support
            textContentType="newPassword" // ios
            autoComplete="new-password" // android
          />
        )}
      />
      {errors.password && <ErrorText message={errors.password.message!} />}
      <Button
        title="Register"
        onPress={onRegister}
        disabled={isSubmitting}
        color={theme.colors.primary}
      />
      <Button
        title="Continue with GitHub"
        onPress={handleRegisterGithub}
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
