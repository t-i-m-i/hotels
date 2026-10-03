import { authClient } from "@/api/authClient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

// Not in the theme palette - destructive actions use a fixed red
// regardless of light/dark, same convention as iOS system destructive UI.
const DESTRUCTIVE_COLOR = "#D32F2F";

// BetterAuth only stores a single `name` field (see (auth)/register.tsx) -
// First/Last are derived for display, not separately stored anywhere.
function splitName(name: string | undefined) {
  if (!name) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export default function Account() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const handleConfirmDelete = async () => {
    const { error } = await authClient.deleteUser({ password });
    if (error) {
      Alert.alert(
        "Couldn't delete account",
        error.message ?? "Please try again.",
      );
      return;
    }
    setIsDeleting(false);
    setPassword("");
  };

  if (isSessionPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.loggedOutText}>
          Please login to view your account
        </Text>
        <View style={styles.loggedOutButtons}>
          <Button
            title="Login"
            onPress={() =>
              router.push({
                pathname: "/(auth)/login",
                params: { redirectTo: "/(tabs)/account" },
              })
            }
          />
          <Button
            title="Register"
            onPress={() =>
              router.push({
                pathname: "/(auth)/register",
                params: { redirectTo: "/(tabs)/account" },
              })
            }
          />
        </View>
      </View>
    );
  }

  const { firstName, lastName } = splitName(session.user.name);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{session.user.name}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>First Name</Text>
        <Text style={styles.value}>{firstName || "—"}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Last Name</Text>
        <Text style={styles.value}>{lastName || "—"}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session.user.email}</Text>
      </View>

      <Button
        testID="logout-button"
        title="Logout"
        onPress={handleLogout}
        color={theme.colors.primary}
      />

      {!isDeleting ? (
        <Button
          testID="delete-account-button"
          title="Delete Account"
          color={DESTRUCTIVE_COLOR}
          onPress={() => setIsDeleting(true)}
        />
      ) : (
        <View style={styles.deleteConfirm}>
          <Text style={styles.value}>
            Enter your password to permanently delete your account. This
            can&apos;t be undone.
          </Text>
          <TextInput
            testID="delete-account-password-input"
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.loggedOutButtons}>
            <Button
              testID="delete-account-confirm-button"
              title="Confirm Delete"
              color={DESTRUCTIVE_COLOR}
              onPress={handleConfirmDelete}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setIsDeleting(false);
                setPassword("");
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  loggedOutText: {
    textAlign: "center",
    fontSize: 16,
    color: theme.colors.text,
  },
  loggedOutButtons: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
  },
  deleteConfirm: {
    gap: 12,
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
