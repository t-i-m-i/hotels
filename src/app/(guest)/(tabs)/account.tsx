import { authClient, type SessionUser } from "@/api/authClient";
import AccountActions from "@/components/AccountActions";
import { useRouter } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";
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
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

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
                params: { redirectTo: "/(guest)/(tabs)/account" },
              })
            }
          />
          <Button
            title="Register"
            onPress={() =>
              router.push({
                pathname: "/(auth)/register",
                params: { redirectTo: "/(guest)/(tabs)/account" },
              })
            }
          />
        </View>
      </View>
    );
  }

  const user = session.user as SessionUser;
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
}));
