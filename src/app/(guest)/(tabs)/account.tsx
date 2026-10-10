import AccountActions from "@/components/AccountActions";
import LoginPrompt from "@/components/LoginPrompt";
import { useSessionUser } from "@/hooks/useSessionUser";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

// BetterAuth only stores a single `name` field (see (auth)/register.tsx) -
// First/Last are derived for display, not separately stored anywhere.
function splitName(name: string | undefined) {
  if (!name) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export default function Account() {
  const user = useSessionUser();

  if (!user) {
    return (
      <LoginPrompt
        message="Please login to view your account"
        redirectTo="/(guest)/(tabs)/account"
      />
    );
  }

  const { firstName, lastName } = splitName(user.name);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>
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
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <AccountActions user={user} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 16,
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
}));
