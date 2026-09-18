import { Hotel } from "@/api/hotels";
import { favoritesActions } from "@/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";

function isHotelArray(value: unknown): value is Hotel[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Hotel).id === "string",
    )
  );
}

export default function useFavoritesPersistence() {
  const hasHydrated = useRef(false);
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);

  useEffect(() => {
    const getFavoritesFromStorage = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          const parsedFavorites: unknown = JSON.parse(storedFavorites);
          if (isHotelArray(parsedFavorites)) {
            dispatch(favoritesActions.setFavorites(parsedFavorites));
          } else {
            console.warn(
              "Ignoring malformed favorites data in storage:",
              parsedFavorites,
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
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(favorites),
        );
      } catch (error) {
        console.error("Failed to persist favorites:", error);
      }
    };

    persistFavorites();
   
  }, [favorites]);
}