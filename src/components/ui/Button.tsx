import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Button({
  title,
  onPress,
  fontSize = 17,
  isPending = false,
}: {
  title: string;
  onPress: () => void;
  fontSize?: number;
  isPending?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityState={{ disabled: isPending }}
      style={({ pressed }) => [
        styles.button,
        isPending && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
  },
  pressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  disabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },
}));
