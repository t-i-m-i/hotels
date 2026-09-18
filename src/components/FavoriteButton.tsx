import type { Hotel } from "@/api/hotels";
import { favoritesActions, selectIsFavorite } from "@/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SymbolView } from "expo-symbols";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

export default function FavoriteButton({ hotel }: { hotel: Hotel }) {
  const isFavorite = useAppSelector((state) =>
    selectIsFavorite(state, hotel.id),
  );
  const dispatch = useAppDispatch();

  const toggleFavorite = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch(favoritesActions.toggleFavorite(hotel));
  };

  return (
    <Pressable
      onPress={toggleFavorite}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite ? "Remove from favorites" : "Add to favorites"
      }
    >
      <SymbolView
        name={isFavorite ? "heart.fill" : "heart"}
        size={22}
        tintColor={isFavorite ? "#FF3B30" : "#8E8E93"}
        fallback={
          <Text style={styles.fallback}>{isFavorite ? "♥" : "♡"}</Text>
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fallback: {
    fontSize: 20,
    lineHeight: 22,
  },
});
