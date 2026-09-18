import type { Hotel } from "@/api/hotels";
import { favoritesActions, selectIsFavorite } from "@/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { GestureResponderEvent, Pressable, Text } from "react-native";

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
    <Pressable onPress={toggleFavorite}>
      <Text>{isFavorite ? "is fav" : "add to fav"}</Text>
    </Pressable>
  );
}
