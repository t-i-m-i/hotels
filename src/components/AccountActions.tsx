import { authClient, type SessionUser } from "@/api/authClient";
import useActiveRole from "@/hooks/useActiveRole";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

// Not in the theme palette - destructive actions use a fixed red
// regardless of light/dark, same convention as iOS system destructive UI.
const DESTRUCTIVE_COLOR = "#D32F2F";

// Where each role's tree lives — matches the Stack.Protected groups in
// src/app/_layout.tsx. Switching roles here is just updating the stored
// preference useActiveRole reads; this redirect is only to land the user
// on that tree's home screen instead of wherever the guard switch leaves
// them.
const ROLE_HOME: Record<string, Href> = {
  admin: "/(admin)/(tabs)",
  host: "/(host)/(tabs)",
  guest: "/(guest)/(tabs)",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  host: "Host",
  guest: "Guest",
};

/**
 * Logout / delete-account / role-switcher — the account actions every
 * role's account tab needs, regardless of what else that tab shows. Shared
 * so guest/host/admin don't each reimplement the delete confirmation flow.
 */
export default function AccountActions({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { activeRole, setActiveRole } = useActiveRole();
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const handleSwitchRole = (role: string) => {
    setActiveRole(role, user.roles);
    router.replace(ROLE_HOME[role]);
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

  return (
    <View style={styles.container}>
      {user.roles.length > 1 && (
        <View style={styles.field}>
          <Text style={styles.label}>Viewing as</Text>
          <View style={styles.roleSwitcher}>
            {user.roles.map((role) => (
              <Pressable
                key={role}
                testID={`switch-role-${role}`}
                onPress={() => handleSwitchRole(role)}
                style={[
                  styles.roleOption,
                  role === activeRole && styles.roleOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    role === activeRole && styles.roleOptionTextActive,
                  ]}
                >
                  {ROLE_LABELS[role] ?? role}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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
          <View style={styles.row}>
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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 16,
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
  roleSwitcher: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  roleOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  roleOptionTextActive: {
    color: theme.colors.background,
  },
  deleteConfirm: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
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
