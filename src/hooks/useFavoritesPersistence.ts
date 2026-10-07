import { hotelArraySchema } from "@/schemas/hotel";
import { favoritesActions } from "@/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { z } from "zod";

export default function useFavoritesPersistence() {
  const hasHydrated = useRef(false);
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);

  useEffect(() => {
    const getFavoritesFromStorage = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          const result = hotelArraySchema.safeParse(
            JSON.parse(storedFavorites),
          );
          if (result.success) {
            dispatch(favoritesActions.setFavorites(result.data));
          } else {
            console.warn(
              "Ignoring malformed favorites data in storage:",
              z.prettifyError(result.error),
            );
          }
        }
      } catch (error) {
        console.error("Failed to retrieve favorites from storage:", error);
      } finally {
        hasHydrated.current = true;
      }
    };

    getFavoritesFromStorage();
  }, [dispatch]);

  useEffect(() => {
    // guard against persisting before the initial load from AsyncStorage is complete
    if (!hasHydrated.current) {
      return;
    }
    const persistFavorites = async () => {
      try {
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to persist favorites:", error);
      }
    };
    persistFavorites();
  }, [favorites]);
}
