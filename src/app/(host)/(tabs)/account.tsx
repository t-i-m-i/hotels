import { authClient, type SessionUser } from "@/api/authClient";
import AccountActions from "@/components/AccountActions";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function HostAccount() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  if (isSessionPending || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const user = session.user as SessionUser;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>
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
