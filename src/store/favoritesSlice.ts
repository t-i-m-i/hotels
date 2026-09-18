import { Hotel } from "@/api/hotels";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState: Hotel[] = [];

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Hotel[]>) => {
      return action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<Hotel>) => {
      const idx = state.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.splice(idx, 1);
      } else {
        state.push(action.payload);
      }
    },
  },
});

export const { reducer: favoritesReducer, actions: favoritesActions } =
  favoritesSlice;

// Exported selector function
export const selectIsFavorite = (state: RootState, hotelId: string) =>
  state.favorites.some((fav) => fav.id === hotelId);
