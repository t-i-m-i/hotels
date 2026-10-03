import { configureStore } from "@reduxjs/toolkit";
import { activeRoleReducer } from "./activeRoleSlice";
import { favoritesReducer } from "./favoritesSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    activeRole: activeRoleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
