// Unistyles needs a native binary (Nitro); swap in its Jest mock, then run the
// app's real theme config so useUnistyles() returns real colors.
import "react-native-unistyles/mocks";
import "@/unistyles";
